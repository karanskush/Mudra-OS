package logger

import (
	"log"
	"os"
)

var (
	logger = log.New(os.Stdout, "", log.LstdFlags)
)

// Info logs an info message
func Info(format string, v ...interface{}) {
	logger.Printf("[INFO] "+format, v...)
}

// Infof logs an info message with formatting
func Infof(format string, v ...interface{}) {
	logger.Printf("[INFO] "+format, v...)
}

// Error logs an error message
func Error(format string, v ...interface{}) {
	logger.Printf("[ERROR] "+format, v...)
}

// Errorf logs an error message with formatting
func Errorf(format string, v ...interface{}) {
	logger.Printf("[ERROR] "+format, v...)
}

// Debug logs a debug message
func Debug(format string, v ...interface{}) {
	if os.Getenv("DEBUG") == "true" {
		logger.Printf("[DEBUG] "+format, v...)
	}
}

// Fatal logs a fatal message and exits
func Fatal(format string, v ...interface{}) {
	logger.Fatalf("[FATAL] "+format, v...)
}

// Warn logs a warning message
func Warn(format string, v ...interface{}) {
	logger.Printf("[WARN] "+format, v...)
}

// SetOutput sets the output destination for the logger
func SetOutput(w *os.File) {
	logger.SetOutput(w)
}

// SetFlags sets the output flags for the logger
func SetFlags(flags int) {
	logger.SetFlags(flags)
}

// SetPrefix sets the output prefix for the logger
func SetPrefix(prefix string) {
	logger.SetPrefix(prefix)
}
