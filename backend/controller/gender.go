package controller

import (
   "net/http"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
)

func GetGenders(c *gin.Context) {
   var genders []entity.Gender

   db := config.DB()
   db.Find(&genders)
   c.JSON(http.StatusOK, &genders)
}