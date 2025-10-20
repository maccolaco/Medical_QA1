use anyhow::Result;
use std::process::Command;
use std::path::Path;
use tokio::fs;

pub struct OcrProcessor;

impl OcrProcessor {
    pub fn new() -> Self {
        Self
    }

    pub async fn process_file(&self, file_path: &str) -> Result<String> {
        let path = Path::new(file_path);
        
        if !path.exists() {
            return Err(anyhow::anyhow!("File not found: {}", file_path));
        }

        // Check if file is a PDF
        if path.extension().and_then(|s| s.to_str()) == Some("pdf") {
            self.process_pdf(file_path).await
        } else {
            // Assume it's an image file
            self.process_image(file_path).await
        }
    }

    async fn process_pdf(&self, file_path: &str) -> Result<String> {
        // For now, return placeholder text
        // In a real implementation, you would:
        // 1. Convert PDF pages to images using pdfium or poppler
        // 2. Run OCR on each page
        // 3. Combine the results
        
        Ok(format!("Extracted text from PDF: {}", file_path))
    }

    async fn process_image(&self, file_path: &str) -> Result<String> {
        // Check if Tesseract is available
        let tesseract_available = Command::new("tesseract")
            .arg("--version")
            .output()
            .is_ok();

        if tesseract_available {
            self.run_tesseract(file_path).await
        } else {
            // Fallback to placeholder text
            Ok(format!("Tesseract not available. Extracted text from image: {}", file_path))
        }
    }

    async fn run_tesseract(&self, file_path: &str) -> Result<String> {
        let output = Command::new("tesseract")
            .arg(file_path)
            .arg("stdout")
            .arg("-l")
            .arg("eng")
            .output()?;

        if output.status.success() {
            let text = String::from_utf8(output.stdout)?;
            Ok(text.trim().to_string())
        } else {
            let error = String::from_utf8(output.stderr)?;
            Err(anyhow::anyhow!("Tesseract error: {}", error))
        }
    }
}

