package controller

import (
   "net/http"
   "gorm.io/gorm"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
   "time"
)

func GetRooms(c *gin.Context) {
    var room []entity.Room

    db := config.DB()
    results := db.Preload("Employee").Preload("PetAllow").Preload("RoomType").Find(&room)
    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, room)
}

func GetRoomByID(c *gin.Context) {
    ID := c.Param("id")
	var room entity.Room

	db := config.DB()
	results := db.Preload("Employee").Preload("PetAllow").Preload("RoomType").Find(&room, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if room.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}
	c.JSON(http.StatusOK, room)
}

func CreateRoom(c *gin.Context) {
    var room entity.Room

    if err := c.ShouldBindJSON(&room); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()  // ตรวจสอบว่าฐานข้อมูลเชื่อมต่อได้ถูกต้อง

    var employee entity.Employee
    if err := db.First(&employee, room.EmployeeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบพนักงาน"})
        return
    }

    var roomtype entity.RoomType
    if err := db.First(&roomtype, room.RoomTypeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบประเภทห้องพัก"})
        return
    }

    var petallow entity.PetAllow
    if err := db.First(&petallow, room.PetAllowID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบการอนุญาติเลี้ยงสัตว์"})
        return
    }

    r := entity.Room{
        RoomName:  room.RoomName,
        RoomRent:  room.RoomRent,
        RoomLimit: room.RoomLimit,
        DateCreate: time.Now(),
        RoomTypeID: room.RoomTypeID,
        RoomType:   roomtype,
        PetAllowID: room.PetAllowID,
        PetAllow:   petallow,
        EmployeeID: room.EmployeeID,
        Employee:   employee,
    }

    if err := db.Create(&r).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "สร้างห้องพักสำเร็จ"})
}

func CheckRoomName (c *gin.Context){
    var room entity.Room
    Name := c.Param("roomName")

    db := config.DB()

    roomResult := db.Where("room_name = ?", Name).First(&room)

    if roomResult.Error == gorm.ErrRecordNotFound {
        c.JSON(http.StatusOK, gin.H{
            "isValid": true,
        })
        return
    }

    // ถ้ามี error อื่นๆ
    if roomResult.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": roomResult.Error.Error(),
        })
        return
    }

    // ถ้าพบข้อมูล แสดงว่าชื่อห้องนี้ถูกใช้ไปแล้ว (invalid)
    c.JSON(http.StatusOK, gin.H{
        "isValid": false,
    })
}

func UpdateRoom(c *gin.Context) {
    var room entity.Room
	roomID := c.Param("id")

	db := config.DB()
	result := db.First(&room, roomID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบห้องพัก"})
		return
	}

	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	result = db.Save(&room)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "แก้ไขข้อมูลห้องพักไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "แก้ไขข้อมูลห้องพักสำเร็จ"})
}

func DeleteRoom(c *gin.Context) {
    var room entity.Room
    roomID := c.Param("id")

	db := config.DB()

    if err := db.First(&room, roomID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบห้องพัก"})
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

    if err := tx.Model(&room).Update("deleted_at", time.Now()).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบข้อมูลห้องพักไม่สำเร็จ"})
        return
    }

	c.JSON(http.StatusOK, gin.H{"message": "ลบข้อมูลห้องพักสำเร็จ"})
}