package controller

import (
	"net/http"
	"time"

	"github.com/ThanawitGZS/SE-Project/config"
	"github.com/ThanawitGZS/SE-Project/entity"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func GetEmployees(c *gin.Context) {
	var employees []entity.Employee
 
	db := config.DB()
	results := db.Preload("Gender").Preload("Position").Find(&employees)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, employees)
 }

func GetEmployeeByID(c *gin.Context) {
	ID := c.Param("id")
	var employee entity.Employee
 
	db := config.DB()
	results := db.Preload("Gender").Preload("Position").First(&employee, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
 
	if employee.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}
	c.JSON(http.StatusOK, employee)
 }

 func CreateEmployee(c *gin.Context) {
    var employee entity.Employee
    
    // bind เข้าตัวแปร employee
    if err := c.ShouldBindJSON(&employee); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()

    // ค้นหา gender ด้วย id
	var gender entity.Gender
	db.First(&gender, employee.GenderID)
	if gender.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเพศ"})
		return
	}

    // ค้นหา position ด้วย id
    var position entity.Position
	db.First(&position, employee.PositionID)
	if position.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่ง"})
		return
	}

    hashedPassword, _ := config.HashPassword(employee.Password)

	// สร้าง Employee
	e := entity.Employee{
		FirstName:  employee.FirstName, 
		LastName:   employee.LastName,  
		Email:      employee.Email,
		NationalId: employee.NationalId,
		PhoneNumber: employee.PhoneNumber,     
		Password:   hashedPassword,
        Profile:    employee.Profile,
		GenderID:   employee.GenderID,
		Gender:     gender,
        PositionID: employee.PositionID,
        Position:   position,
	}

    if err := db.Create(&e).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"message": "ลงทะเบียนพนักงานสำเร็จ"})
}

func UpdateEmployee(c *gin.Context) {
	var employee entity.Employee
	employeeID := c.Param("id")
 
	db := config.DB()
	result := db.First(&employee, employeeID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพนักงาน"})
		return
	}
 
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}
 
	result = db.Save(&employee)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "แก้ไขข้อมูลไม่สำเร็จ"})
		return
	}
 
	c.JSON(http.StatusOK, gin.H{"message": "แก้ไขข้อมูลสำเร็จ"})
 }
 
 func DeleteEmployee(c *gin.Context) {
	 id := c.Param("id")
 
	 db := config.DB()
 
	 var employee entity.Employee
	 if err := db.First(&employee, id).Error; err != nil {
		 c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพนักงาน"})
		 return
	 }
 
	 tx := db.Begin()
	 if tx.Error != nil {
		 c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		 return
	 }
 
	 defer func() {
		 if r := recover(); r != nil {
			 tx.Rollback()
			 c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed: "})
		 }
	 }()
 
	 // Soft delete member
	 if err := tx.Model(&employee).Update("deleted_at", time.Now()).Error; err != nil {
		 tx.Rollback()
		 c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		 return
	 }
 
	 if err := tx.Commit().Error; err != nil {
		 c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบข้อมูลไม่สำเร็จ"})
		 return
	 }
 
	 c.JSON(http.StatusOK, gin.H{"message": "ลบข้อมูลสำเร็จ"})
 }
 
 func ChangePasswordEmployee(c *gin.Context) {
	 var employee entity.Employee
	 employeeID := c.Param("id")
 
	 // Struct for receiving JSON payload
	 var payload struct {
		 OldPassword     string `json:"old_password"`
		 NewPassword     string `json:"new_password"`
		 ConfirmPassword string `json:"confirm_password"`
	 }
 
	 db := config.DB()
	 result := db.First(&employee, employeeID)
	 if result.Error != nil {
		 c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพนักงาน"})
		 return
	 }
 
	 // Bind the incoming JSON to the payload struct
	 if err := c.ShouldBindJSON(&payload); err != nil {
		 c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		 return
	 }
 
	 // Verify that old password is correct
	 err := bcrypt.CompareHashAndPassword([]byte(employee.Password), []byte(payload.OldPassword))
	 if err != nil {
		 c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสผ่านเดิมไม่ถูกต้อง"})
		 return
	 }
 
	 // Check if new password and confirm password match
	 if payload.NewPassword != payload.ConfirmPassword {
		 c.JSON(http.StatusBadRequest, gin.H{"error": "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน"})
		 return
	 }
 
	 // Hash the new password
	 hashedPassword, err := config.HashPassword(payload.NewPassword)
	 if err != nil {
		 c.JSON(http.StatusInternalServerError, gin.H{"error": "เข้ารหัส รหัสผ่านไม่สำเร็จ"})
		 return
	 }
 
	 // Update the employee's password in the database
	 result = db.Model(&employee).Update("password", hashedPassword)
	 if result.Error != nil {
		 c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนรหัสผ่านไม่สำเร็จ"})
		 return
	 }
 
	 // Respond with success message
	 c.JSON(http.StatusOK, gin.H{"message": "เปลี่ยนรหัสผ่านสำเร็จ"})
 }
 
 func CheckEmail(c *gin.Context) {
	 var employee entity.Employee
	 var member entity.Member
	 Email := c.Param("email")
 
	 db := config.DB()
	 
	 // Query for phone number in employee table
	 employeeResult := db.Where("email = ?", Email).First(&employee)
	 
	 // Query for phone number in member table
	 memberResult := db.Where("email = ?", Email).First(&member)

	// Check if an error occurred in member query (excluding "record not found")
	if memberResult.Error != nil && memberResult.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": memberResult.Error.Error()})
		return
	}

	// Check if an error occurred in employee query (excluding "record not found")
	if employeeResult.Error != nil && employeeResult.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": employeeResult.Error.Error()})
		return
	}
	
	 // Check if the Email exists in either table
	if memberResult.RowsAffected > 0 || employeeResult.RowsAffected > 0 {
		// Email exists in either member or employee table
		c.JSON(http.StatusOK, gin.H{
			"isValid": false, // Indicating that the Email is already in use
		})
	} else {
		// Email does not exist in either table, it is valid for new registration
		c.JSON(http.StatusOK, gin.H{
			"isValid": true, // Indicating that the Email can be used
		})
	}
 }

 func CheckPhone(c *gin.Context) {
	var member entity.Member
	var employee entity.Employee
	Phone := c.Param("phoneNumber")

	db := config.DB()

	// Query for phone number in member table
	memberResult := db.Where("phone_number = ?", Phone).First(&member)

	// Query for phone number in employee table
	employeeResult := db.Where("phone_number = ?", Phone).First(&employee)

	// Check if an error occurred in member query (excluding "record not found")
	if memberResult.Error != nil && memberResult.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": memberResult.Error.Error()})
		return
	}

	// Check if an error occurred in employee query (excluding "record not found")
	if employeeResult.Error != nil && employeeResult.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": employeeResult.Error.Error()})
		return
	}

	// Check if the phone number exists in either table
	if memberResult.RowsAffected > 0 || employeeResult.RowsAffected > 0 {
		// Phone number exists in either member or employee table
		c.JSON(http.StatusOK, gin.H{
			"isValid": false, // Indicating that the phone number is already in use
		})
	} else {
		// Phone number does not exist in either table, it is valid for new registration
		c.JSON(http.StatusOK, gin.H{
			"isValid": true, // Indicating that the phone number can be used
		})
	}
}

func CheckNationalID(c *gin.Context) {
	var employee entity.Employee
	var member entity.Member
	ID := c.Param("nationalID")

	db := config.DB()

	// Query for national ID in employee table
	employeeResult := db.Where("national_id = ?", ID).First(&employee)
	// Query for phone number in member table
	memberResult := db.Where("national_id = ?", ID).First(&member)

	// Check if an error occurred in member query (excluding "record not found")
	if memberResult.Error != nil && memberResult.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": memberResult.Error.Error()})
		return
	}

	// Check if an error occurred in employee query (excluding "record not found")
	if employeeResult.Error != nil && employeeResult.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": employeeResult.Error.Error()})
		return
	}

	// Check if the phone number exists in either table
	if memberResult.RowsAffected > 0 || employeeResult.RowsAffected > 0 {
		// Phone number exists in either member or employee table
		c.JSON(http.StatusOK, gin.H{
			"isValid": false, // Indicating that the phone number is already in use
		})
	} else {
		// Phone number does not exist in either table, it is valid for new registration
		c.JSON(http.StatusOK, gin.H{
			"isValid": true, // Indicating that the phone number can be used
		})
	}

}
