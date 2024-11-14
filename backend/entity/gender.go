package entity

import (
	"gorm.io/gorm"
)

type Gender struct {
	gorm.Model
	Name string

	Employees []Employee `gorm:"foreignKey:gender_id"`
	Member []Member `gorm:"foreignKey:gender_id"`
}
