package entity

import (
	"gorm.io/gorm"
	"time"
)

type Room struct {
	gorm.Model
	RoomName string
	RoomRent uint
	RoomLimit uint
	DateCreate time.Time

	RoomTypeID uint
	RoomType   RoomType `gorm:"foreignKey: room_type_id"`

	PetAllowID uint
	PetAllow   PetAllow `gorm:"foreignKey: pet_allow_id"`

	EmployeeID		uint		
	Employee		Employee	`gorm:"foreignKey: employee_id"`
}