package controller

import (
   "net/http"
   "gorm.io/gorm"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
   "time"
)

func GetFacilitys(c *gin.Context) {
    var facility []entity.Facility

    db := config.DB()
    results := db.Preload("Employee").Preload("FacilityStatus").Preload("FacilityType").Find(&facility)
    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, facility)
}

func GetFacilityOpen(c *gin.Context) {
    var facility []entity.Facility

    db := config.DB()
    results := db.Preload("FacilityStatus").Preload("FacilityType").Where("facility_status_id = ?", 1).Find(&facility)
    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, facility)
}

func GetFacilityByID(c *gin.Context) {
    ID := c.Param("id")
	var facility entity.Facility

	db := config.DB()
	results := db.Preload("Employee").Preload("FacilityStatus").Preload("FacilityType").Find(&facility, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if facility.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}
	c.JSON(http.StatusOK, facility)
}

func CreateFacility(c *gin.Context) {
    var facility entity.Facility

    if err := c.ShouldBindJSON(&facility); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()  // ตรวจสอบว่าฐานข้อมูลเชื่อมต่อได้ถูกต้อง

    var employee entity.Employee
    if err := db.First(&employee, facility.EmployeeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพนักงาน"})
        return
    }

    var facilitytype entity.FacilityType
    if err := db.First(&facilitytype, facility.FacilityTypeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประเภทพื้นที่ส่วนกลาง"})
        return
    }

    var facilitystatus entity.FacilityStatus
    if err := db.First(&facilitystatus, facility.FacilityStatusID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบสถานะพื้นที่ส่วนกลาง"})
        return
    }

    f := entity.Facility{
        FacilityName:  		facility.FacilityName,
        Using:              facility.Using,
        Capacity:   		facility.Capacity,
		TimeOpen: 			facility.TimeOpen,
		TimeClose: 			facility.TimeClose,
		Descript: 			facility.Descript,
        DateCreate:         time.Now(),
		FacilityTypeID: 	facility.FacilityTypeID,
        FacilityType:   	facilitytype,
		FacilityStatusID: 	facility.FacilityStatusID,
		FacilityStatus: 	facilitystatus,
        EmployeeID: 		facility.EmployeeID,
        Employee:   		employee,
    }

    if err := db.Create(&f).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "สร้างพื้นที่ส่วนกลางสำเร็จ"})
}

func UpdateFacility(c *gin.Context) {
    var facility entity.Facility
	facilityID := c.Param("id")

	db := config.DB()
	result := db.First(&facility, facilityID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพื้นที่ส่วนกลาง"})
		return
	}

	if err := c.ShouldBindJSON(&facility); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	result = db.Save(&facility)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "แก้ไขข้อมูลพื้นที่ส่วนกลางไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "แก้ไขข้อมูลพื้นที่ส่วนสำเร็จ"})
}

func DeleteFacility(c *gin.Context) {
    var facility entity.Facility
    facilityID := c.Param("id")

	db := config.DB()

    if err := db.First(&facility, facilityID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพื้นที่ส่วนกลาง"})
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

    if err := tx.Model(&facility).Update("deleted_at", time.Now()).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบข้อมูลพื้นที่ส่วนกลางไม่สำเร็จ"})
        return
    }

	c.JSON(http.StatusOK, gin.H{"message": "ลบข้อมูลพื้นที่ส่วนกลางสำเร็จ"})
}

func CheckFacilityName (c *gin.Context){
    var facility entity.Facility
    Name := c.Param("facilityName")

    db := config.DB()

    facilityResult := db.Where("facility_name = ?", Name).First(&facility)

    if facilityResult.Error == gorm.ErrRecordNotFound {
        c.JSON(http.StatusOK, gin.H{
            "isValid": true,
        })
        return
    }

    // ถ้ามี error อื่นๆ
    if facilityResult.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": facilityResult.Error.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "isValid": false,
    })
}