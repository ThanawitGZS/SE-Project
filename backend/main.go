package main

import (
	"net/http"
	"github.com/ThanawitGZS/SE-Project/config"
	"github.com/ThanawitGZS/SE-Project/controller"
	"github.com/ThanawitGZS/SE-Project/middlewares"
	"github.com/gin-gonic/gin"
)

const PORT = "8000"

func main() {
   // open connection database
    config.ConnectionDB()

   // Generate databases
    config.SetupDatabase()

    r := gin.Default()
    r.Use(CORSMiddleware())

   // Auth Route
    r.POST("/signIn", controller.SignIn)

    router := r.Group("/")
    {   
        router.Use(middlewares.Authorizes())

        // Employee Route
        r.POST("/employee", controller.CreateEmployee)
        r.GET("/employees", controller.GetEmployees)
        r.GET("/employee/:id", controller.GetEmployeeByID)
        r.PATCH("/employee/:id", controller.UpdateEmployee)
        r.DELETE("/employee/:id", controller.DeleteEmployee)
        r.PATCH("/employee/:id/changePasswordEmployee", controller.ChangePasswordEmployee)
        r.POST("/checkEmail/:email", controller.CheckEmail)
        r.POST("/checkPhone/:phoneNumber", controller.CheckPhone)
        r.POST("/checkNationalID/:nationalID", controller.CheckNationalID)

        // Member Route
        r.POST("/member", controller.CreateMember)
        r.GET("/members", controller.GetMembers)
        r.GET("/member/:id", controller.GetMemberByID)
        r.PATCH("/member/:id", controller.UpdateMember)
        r.DELETE("/member/:id", controller.DeleteMember)
        r.PATCH("/member/:id/chanagePasswordMember", controller.ChangePasswordMember)

        //Room Routes
        r.POST("/room", controller.CreateRoom)
        r.PATCH("/room/:id", controller.UpdateRoom)
        r.DELETE("/room/:id", controller.DeleteRoom)
        r.GET("/room/:id", controller.GetRoomByID)
        r.GET("/rooms", controller.GetRooms)
        r.POST("/checkRoomName/:roomName", controller.CheckRoomName)
        r.GET("/roomtypes", controller.GetRoomTypes) //RoomType
        r.GET("/petallows", controller.GetPetAllows) //PetAllow

        // Facility Routes
        r.POST("/facility", controller.CreateFacility)
        r.PATCH("/facility/:id", controller.UpdateFacility)
        r.DELETE("/facility/:id", controller.DeleteFacility)
        r.GET("/facility/:id", controller.GetFacilityByID)
        r.GET("/facilitys", controller.GetFacilitys)
        r.GET("/facilityOpen", controller.GetFacilityOpen)
        r.POST("/checkFacilityName/:facilityName", controller.CheckFacilityName)
        r.GET("/facilitystatus", controller.GetFacilityStatus)
        r.GET("/facilitytype", controller.GetFacilityTypes)

        r.POST("/booking", controller.CreateBooking)
        r.DELETE("/booking/:id", controller.DeleteBookingByID)
        r.DELETE("/bookings/:id", controller.DeleteBookingsByFacilityID)
        r.GET("/booking/:id", controller.GetBookingByID)
        r.GET("/bookingsFacility/:id", controller.GetBookingFacilityByID)
        r.GET("/memberBooking/:id", controller.GetMemberBookingByID)
        r.GET("/bookingMembers/:id", controller.GetBookingMemberbyID)
        r.PUT("/checkBooking", controller.CheckBooking)

        // Gender Routes
        r.GET("/genders", controller.GetGenders)

        // Position Routes
        r.GET("/positions", controller.GetPositions)
        r.GET("/positionEmployee", controller.GetPositionEmployee)

}

    r.GET("/", func(c *gin.Context) {
        c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
    })

    // Run the server
    r.Run("localhost:" + PORT)
}

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}