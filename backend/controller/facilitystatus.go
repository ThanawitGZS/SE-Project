package controller

import (
   "net/http"
   "github.com/ThanawitGZS/SE-Project/config"
   "github.com/ThanawitGZS/SE-Project/entity"
   "github.com/gin-gonic/gin"
)

func GetFacilityStatus(c *gin.Context) {
   var FacilityStatus []entity.FacilityStatus

   db := config.DB()
   db.Find(&FacilityStatus)
   c.JSON(http.StatusOK, &FacilityStatus)
}