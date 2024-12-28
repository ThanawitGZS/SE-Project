package entity

import (
	"gorm.io/gorm"
	"time"
)

type Room struct {
	gorm.Model
	RoomName string `valid:"required~RoomName is required"`
	RoomRent  uint `valid:"required~RoomRent is required"`
	RoomLimit uint `valid:"required~RoomLimit is required"`
	DateCreate time.Time `valid:"required~DateCreate is required"`

	RoomTypeID uint 	`valid:"required~RoomTypeID is required"`
	RoomType   RoomType `gorm:"foreignKey: room_type_id"`

	PetAllowID uint 	`valid:"required~PetAllowID is required"`
	PetAllow   PetAllow `gorm:"foreignKey: pet_allow_id"`

	EmployeeID		uint		`valid:"required~EmployeeID is required"`
	Employee		Employee	`gorm:"foreignKey: employee_id"`
}