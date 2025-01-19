package controller

import (
	"net/http"
	"github.com/ThanawitGZS/SE-Project/config"
	"github.com/ThanawitGZS/SE-Project/entity"
	"github.com/gin-gonic/gin"
	"time"
    "gorm.io/gorm"
 )

 func GetBookingByID(c *gin.Context) {
	var Booking []entity.Booking
    ID := c.Param("id")
 
	db := config.DB()
	results := db.Unscoped().Find(&Booking, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, Booking)
}

 func GetBookingFacilityByID(c *gin.Context) {
	var count int64
	ID := c.Param("id")

	db := config.DB()
	results := db.Model(&entity.Booking{}).Where("facility_id = ?", ID).Count(&count)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, results.Error.Error())
		return
	}
	c.JSON(http.StatusOK, count)
}

func GetMemberBookingByID(c *gin.Context) {
	var Booking []entity.Booking
    ID := c.Param("id")
 
	db := config.DB()
	results := db.Preload("Member").Where("facility_id = ?", ID).Find(&Booking)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, Booking)
}

 func GetBookingMemberbyID(c *gin.Context) {
	var Booking []entity.Booking
    ID := c.Param("id")
 
	db := config.DB()
	results := db.Preload("Facility").Preload("Member").Where("member_id = ?", ID).Find(&Booking)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, Booking)
 }

 func CreateBooking(c *gin.Context) {
    var booking entity.Booking

    if err := c.ShouldBindJSON(&booking); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()  // ตรวจสอบว่าฐานข้อมูลเชื่อมต่อได้ถูกต้อง

    var member entity.Member
    if err := db.First(&member, booking.MemberID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลผู้พักอาศัย"})
        return
    }

    var facility entity.Facility
    if err := db.First(&facility, booking.FacilityID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลพื้นที่ส่วนกลาง"})
        return
    }

    B := entity.Booking{
		MemberID: 	booking.MemberID,
		Member: 	member,
		FacilityID: booking.FacilityID,
		Facility: 	facility,
    }

    if err := db.Create(&B).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "ลงชื่อเข้าใช้งานสำเร็จ"})
}

func DeleteBookingByID(c *gin.Context) {
    var Booking entity.Booking
    BookingID := c.Param("id")

	db := config.DB()

    if err := db.First(&Booking, BookingID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลการลงชื่อเข้าใช้งาน"})
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

    if err := tx.Model(&Booking).Update("deleted_at", time.Now()).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบการลงชื่อเข้าใช้งานไม่สำเร็จ"})
        return
    }

	c.JSON(http.StatusOK, gin.H{"message": "ลบการลงชื่อเข้าใช้งานสำเร็จ"})
}

func DeleteBookingsByFacilityID(c *gin.Context) {
    facilityID := c.Param("id") 
    db := config.DB()

    // ตรวจสอบ facilityID
    if facilityID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility_id"})
        return
    }

    // เริ่ม Transaction
    tx := db.Begin()
    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
        return
    }

    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed"})
        }
    }()

    // ลบข้อมูล (soft delete)
    result := tx.Model(&entity.Booking{}).
        Where("facility_id = ? AND deleted_at IS NULL", facilityID).
        Update("deleted_at", time.Now())
    
    if result.Error != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete bookings: " + result.Error.Error()})
        return
    }

    // // หากไม่มีข้อมูลที่ถูกลบ
    // if result.RowsAffected == 0 {
    //     tx.Rollback()
    //     c.JSON(http.StatusNotFound, gin.H{"error": "ไม่เจอข้อมูลการจองของพื้นที่"})
    //     return
    // }

    // Commit Transaction
    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
        return
    }

    // ส่งผลลัพธ์กลับ
    c.JSON(http.StatusOK, gin.H{"message":"ลบข้อมูลการจองสำเร็จ",})
}



func CheckBooking (c *gin.Context){
    var booking entity.Booking
    
    var requestBody struct {
		MemberID uint
		FacilityID uint
	}

    // Parse the JSON body into requestBody
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

    db := config.DB()

    Result := db.Where("member_id = ? AND facility_id = ?", requestBody.MemberID, requestBody.FacilityID).First(&booking)

    if Result.Error == gorm.ErrRecordNotFound {
        c.JSON(http.StatusOK, gin.H{
            "canBook": true,
        })
        return
    }

    // ถ้ามี error อื่นๆ
    if Result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": Result.Error.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "canBook": false,
        "message": "มีการจองเข้าใช้งานอยู่แล้ว",
    })
}