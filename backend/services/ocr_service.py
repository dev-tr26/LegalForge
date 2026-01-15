from paddleocr import PaddleOCR
from pdf2image import convert_from_path
import cv2
import numpy as np
from PIL import Image
import logging
import os 

logger = logging.getLogger(__name__)

POPPLER_PATH = r"C:\poppler\Library\bin"


class OCRService:
    def __init__(self):
        """Initialize PaddleOCR with English language support"""
        try:
            self.ocr = PaddleOCR(
                use_angle_cls=True,
                lang='en',
                show_log=False,
                use_gpu=False
            )
            logger.info("PaddleOCR initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {str(e)}")
            raise

    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF file"""
        try:
            logger.info(f"Converting PDF to images: {pdf_path}")
            images = convert_from_path(
                pdf_path,
                poppler_path=POPPLER_PATH,
                dpi=300,
            )
            
            full_text = []
            for page_num, image in enumerate(images):
                logger.info(f"Processing page {page_num + 1}/{len(images)}")
                
                # Convert PIL Image to numpy array
                img_array = np.array(image)
                text = self.extract_text_from_image(img_array)
                
                full_text.append(f"--- Page {page_num + 1} ---\n{text}")
            
            result = "\n\n".join(full_text)
            logger.info(f"PDF processing complete. Extracted {len(result)} characters")
            return result
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def extract_text_from_image(self, image_path_or_array):
        """Extract text from image file or numpy array"""
        try:
            # Handle both file path and numpy array
            if isinstance(image_path_or_array, str):
                logger.info(f"Reading image from path: {image_path_or_array}")
                image = cv2.imread(image_path_or_array)
            else:
                image = image_path_or_array

            # Preprocess image for better OCR
            image = self.preprocess_image(image)

            # Run OCR
            logger.info("Running OCR...")
            result = self.ocr.ocr(image, cls=True)

            # Extract text
            text_lines = []
            if result and result[0]:
                for line in result[0]:
                    if line and len(line) >= 2:
                        text_lines.append(line[1][0])

            extracted_text = "\n".join(text_lines)
            logger.info(f"Extracted {len(text_lines)} lines of text")
            return extracted_text

        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            raise

    def preprocess_image(self, image):
        """Preprocess image for better OCR results"""
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image

            # Apply adaptive thresholding
            processed = cv2.adaptiveThreshold(
                gray, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                11, 2
            )

            # Denoise
            processed = cv2.fastNlMeansDenoising(processed)

            return processed

        except Exception as e:
            logger.warning(f"Image preprocessing failed, using original: {str(e)}")
            return image