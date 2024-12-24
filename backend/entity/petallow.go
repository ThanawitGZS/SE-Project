package entity

import (
	"gorm.io/gorm"
)

type PetAllow struct {
	gorm.Model
	Name string

	Room []Room `gorm:"foreignKey:pet_allow_id"`
}