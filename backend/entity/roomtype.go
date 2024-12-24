package entity

import (
	"gorm.io/gorm"
)

type RoomType struct {
	gorm.Model
	Name string

	Room []Room `gorm:"foreignKey:room_type_id"`
}