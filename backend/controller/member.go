package controller

import (
    "time"
    // "gorm.io/gorm"
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/ThanawitGZS/SE-Project/config"
    "github.com/ThanawitGZS/SE-Project/entity"
	"golang.org/x/crypto/bcrypt"
)

func CreateMember(c *gin.Context) {
    var member entity.Member

    // bind เข้าตัวแปร member
    if err := c.ShouldBindJSON(&member); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()

    // ค้นหา employee ด้วย id
    var employee entity.Employee
    db.First(&employee, member.EmployeeID)
    if employee.ID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพนักงาน"})
        return
    }
	
	// ค้นหา gender ด้วย id
	var gender entity.Gender
	db.First(&gender, member.GenderID)
	if gender.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเพศ"})
		return
	}

	// ค้นหา position ด้วย id
    // var position entity.Position
	// db.First(&position, member.PositionID)
	// if position.ID == 0 {
	// 	c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่ง"})
	// 	return
	// }

	var position entity.Position
	result := db.Where("name = ?", "ผู้พักอาศัย").First(&position)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งผู้พักอาศัย"})
		return
	}

	hashedPassword, _ := config.HashPassword(member.Password)

    // สร้าง Member
    m := entity.Member {
        FirstName:  member.FirstName,					
	    LastName:   member.LastName,				
	    PhoneNumber:member.PhoneNumber,
		Email:      member.Email,
		Password:   hashedPassword,
		Profile:    member.Profile,
		NationalId: member.NationalId,									
	    EmployeeID: member.EmployeeID,				
        Employee:   employee,
		GenderID:   member.GenderID,
		Gender:     gender,
		PositionID: position.ID,
        Position:   position,
    }

    if err := db.Create(&m).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"message": "สมัครสมาชิกสำเร็จ"})
}

func GetMembers(c *gin.Context) {
    var members []entity.Member

    db := config.DB()
    results := db.Preload("Employee").Preload("Gender").Find(&members)
    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, members)
}

func GetMemberByID(c *gin.Context) {
    ID := c.Param("id")
	var user entity.Member

	db := config.DB()
	results := db.Preload("Employee").First(&user, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if user.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UpdateMember(c *gin.Context) {
    var member entity.Member
	memberID := c.Param("id")

	db := config.DB()
	result := db.First(&member, memberID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบสมาชิก"})
		return
	}

	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	result = db.Save(&member)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "แก้ไขข้อมูลไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "แก้ไขข้อมูลสำเร็จ"})
}

func DeleteMember(c *gin.Context) {
    id := c.Param("id")

	db := config.DB()

    var member entity.Member
    if err := db.First(&member, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบสมาชิก"})
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
    if err := tx.Model(&member).Update("deleted_at", time.Now()).Error; err != nil {
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

func ChangePasswordMember(c *gin.Context) {
	var member entity.Member
	memberID := c.Param("id")

	// Struct for receiving JSON payload
	var payload struct {
		OldPassword     string `json:"old_password"`
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	db := config.DB()
	result := db.First(&member, memberID)
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
	err := bcrypt.CompareHashAndPassword([]byte(member.Password), []byte(payload.OldPassword))
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
	result = db.Model(&member).Update("password", hashedPassword)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนรหัสผ่านไม่สำเร็จ"})
		return
	}

	// Respond with success message
	c.JSON(http.StatusOK, gin.H{"message": "เปลี่ยนรหัสผ่านสำเร็จ"})
}