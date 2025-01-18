package controller

import (
   "net/http"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
)

func GetFacilityTypes(c *gin.Context) {
   var FacilityType []entity.FacilityType

   db := config.DB()
   db.Find(&FacilityType)
   c.JSON(http.StatusOK, &FacilityType)
}