package controller

import (
   "net/http"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
)

func GetRoomTypes(c *gin.Context) {
   var roomType []entity.RoomType

   db := config.DB()
   db.Find(&roomType)
   c.JSON(http.StatusOK, &roomType)
}