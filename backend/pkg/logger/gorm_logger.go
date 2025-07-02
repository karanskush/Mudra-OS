package logger

import (
	"context"
	"time"

	"gorm.io/gorm/logger"
)

// GormLogger implements the GORM logger interface
type GormLogger struct {
	SlowThreshold             time.Duration
	LogLevel                  logger.LogLevel
	IgnoreRecordNotFoundError bool
}

// NewGormLogger creates a new GORM logger
func NewGormLogger() *GormLogger {
	return &GormLogger{
		SlowThreshold:             1 * time.Second,
		LogLevel:                  logger.Info,
		IgnoreRecordNotFoundError: true,
	}
}

// LogMode sets the log level
func (l *GormLogger) LogMode(level logger.LogLevel) logger.Interface {
	newLogger := *l
	newLogger.LogLevel = level
	return &newLogger
}

// Info logs info level messages
func (l *GormLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= logger.Info {
		Logger.Infof(msg, data...)
	}
}

// Warn logs warn level messages
func (l *GormLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= logger.Warn {
		Logger.Warnf(msg, data...)
	}
}

// Error logs error level messages
func (l *GormLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.LogLevel >= logger.Error {
		Logger.Errorf(msg, data...)
	}
}

// Trace logs trace level messages (SQL queries)
func (l *GormLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if l.LogLevel <= logger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()

	if err != nil && l.LogLevel >= logger.Error {
		Logger.WithFields(map[string]interface{}{
			"elapsed": elapsed,
			"rows":    rows,
			"sql":     sql,
		}).Errorf("SQL Error: %v", err)
		return
	}

	if l.SlowThreshold != 0 && elapsed > l.SlowThreshold && l.LogLevel >= logger.Warn {
		Logger.WithFields(map[string]interface{}{
			"elapsed": elapsed,
			"rows":    rows,
			"sql":     sql,
		}).Warn("Slow SQL Query")
		return
	}

	if l.LogLevel >= logger.Info {
		Logger.WithFields(map[string]interface{}{
			"elapsed": elapsed,
			"rows":    rows,
		}).Debugf("SQL: %s", sql)
	}
}
