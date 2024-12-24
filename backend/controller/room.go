package controller

import (
   "net/http"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
)

func GetRooms(c *gin.Context) {
    var room []entity.Room

    db := config.DB()
    results := db.Preload("PetAllow").Preload("RoomType").Find(&room)
    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, room)
}