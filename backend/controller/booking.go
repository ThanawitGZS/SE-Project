package controller

import (
	"net/http"
	"github.com/ThanawitGZS/SE-Project/config"
	"github.com/ThanawitGZS/SE-Project/entity"
	"github.com/gin-gonic/gin"
	"time"
 )

 func GetBookings(c *gin.Context) {
	var Booking []entity.Booking
 
	db := config.DB()
	results := db.Preload("Facility").Preload("Member").Find(&Booking)
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