package controller

import (
   "net/http"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
)

func GetPositions(c *gin.Context) {
   var positions []entity.Position
   
   db := config.DB()
   db.Find(&positions)
   c.JSON(http.StatusOK, &positions)
}

func GetPositionEmployee(c *gin.Context) {
   var positions []entity.Position
   
   db := config.DB()
   db.Where("id != ?", 6).Find(&positions)
   c.JSON(http.StatusOK, &positions)
}