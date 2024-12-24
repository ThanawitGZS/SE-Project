package controller

import (
   "net/http"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
)

func GetPetAllows(c *gin.Context) {
   var petAllow []entity.PetAllow

   db := config.DB()
   db.Find(&petAllow)
   c.JSON(http.StatusOK, &petAllow)
}