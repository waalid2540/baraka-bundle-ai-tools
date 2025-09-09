"""
BarakahTool Enterprise PDF Generator
Professional PDF generation using ReportLab - NO HTML/CSS ISSUES
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import inch, cm
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, Circle, String
from reportlab.graphics import renderPDF
import arabic_reshaper
from bidi.algorithm import get_display
from datetime import datetime
import os
import io

class EnterprisePDFGenerator:
    def __init__(self):
        """Initialize the enterprise PDF generator"""
        self.setup_fonts()
        self.setup_colors()
        self.setup_styles()
    
    def setup_fonts(self):
        """Setup Arabic and English fonts"""
        try:
            # Register Arabic fonts (you'd download these)
            # pdfmetrics.registerFont(TTFont('Amiri', 'fonts/Amiri-Regular.ttf'))
            # pdfmetrics.registerFont(TTFont('Amiri-Bold', 'fonts/Amiri-Bold.ttf'))
            pass
        except:
            # Fallback to default fonts
            pass
    
    def setup_colors(self):
        """Setup color palette"""
        self.colors = {
            'primary': HexColor('#d4af37'),      # Gold
            'secondary': HexColor('#50C878'),     # Emerald
            'accent': HexColor('#E8B4B8'),        # Rose Gold
            'text': HexColor('#2c3e50'),          # Dark Blue
            'background': HexColor('#fef5e7'),    # Cream
            'border': HexColor('#d4af37'),        # Gold Border
        }
    
    def setup_styles(self):
        """Setup paragraph styles"""
        styles = getSampleStyleSheet()
        
        # Custom styles
        self.styles = {
            'title': ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=self.colors['primary'],
                alignment=TA_CENTER,
                spaceAfter=20,
                fontName='Helvetica-Bold'
            ),
            'subtitle': ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=self.colors['secondary'],
                alignment=TA_CENTER,
                spaceAfter=15,
                fontName='Helvetica-Oblique'
            ),
            'arabic': ParagraphStyle(
                'Arabic',
                parent=styles['Normal'],
                fontSize=20,
                textColor=self.colors['primary'],
                alignment=TA_CENTER,
                spaceAfter=15,
                spaceBefore=10,
                fontName='Helvetica-Bold'
            ),
            'transliteration': ParagraphStyle(
                'Transliteration',
                parent=styles['Normal'],
                fontSize=14,
                textColor=self.colors['secondary'],
                alignment=TA_CENTER,
                spaceAfter=10,
                fontName='Helvetica-Oblique'
            ),
            'translation': ParagraphStyle(
                'Translation',
                parent=styles['Normal'],
                fontSize=16,
                textColor=self.colors['text'],
                alignment=TA_CENTER,
                spaceAfter=15,
                fontName='Helvetica'
            ),
            'guidance': ParagraphStyle(
                'Guidance',
                parent=styles['Normal'],
                fontSize=10,
                textColor=self.colors['text'],
                alignment=TA_LEFT,
                spaceAfter=5,
                fontName='Helvetica'
            ),
            'footer': ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=10,
                textColor=self.colors['primary'],
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            )
        }
    
    def format_arabic_text(self, arabic_text: str) -> str:
        """Format Arabic text for proper display"""
        try:
            # Reshape Arabic text for proper display
            reshaped_text = arabic_reshaper.reshape(arabic_text)
            # Apply bidirectional algorithm
            bidi_text = get_display(reshaped_text)
            return bidi_text
        except:
            # Fallback to original text
            return arabic_text
    
    def draw_decorative_border(self, canvas_obj, doc):
        """Draw Islamic decorative border"""
        width, height = A4
        margin = 0.5 * inch
        
        # Set colors
        canvas_obj.setStrokeColor(self.colors['border'])
        canvas_obj.setLineWidth(3)
        
        # Main border
        canvas_obj.rect(margin, margin, width - 2*margin, height - 2*margin)
        
        # Inner border
        canvas_obj.setLineWidth(1)
        inner_margin = margin + 0.2 * inch
        canvas_obj.rect(inner_margin, inner_margin, 
                       width - 2*inner_margin, height - 2*inner_margin)
        
        # Corner decorations
        corner_size = 0.3 * inch
        corners = [
            (margin, height - margin - corner_size),  # Top left
            (width - margin - corner_size, height - margin - corner_size),  # Top right
            (margin, margin),  # Bottom left
            (width - margin - corner_size, margin),  # Bottom right
        ]
        
        canvas_obj.setFillColor(self.colors['primary'])
        for x, y in corners:
            canvas_obj.circle(x + corner_size/2, y + corner_size/2, corner_size/4, fill=1)
    
    def add_header_decoration(self, canvas_obj):
        """Add decorative elements to header"""
        width, height = A4
        
        # Bismillah decoration
        canvas_obj.setFont('Helvetica-Bold', 16)
        canvas_obj.setFillColor(self.colors['primary'])
        canvas_obj.drawCentredText(width/2, height - 1.5*inch, 
                                 "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
        
        # Decorative line under header
        canvas_obj.setStrokeColor(self.colors['secondary'])
        canvas_obj.setLineWidth(2)
        canvas_obj.line(1.5*inch, height - 2*inch, width - 1.5*inch, height - 2*inch)
    
    async def create_enterprise_pdf(self, dua_data: dict, situation: str, output_path: str):
        """
        Create enterprise-grade PDF with professional layout
        """
        try:
            # Create document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=A4,
                rightMargin=1*inch,
                leftMargin=1*inch,
                topMargin=1.5*inch,
                bottomMargin=1*inch
            )
            
            # Story elements
            story = []
            
            # Title section
            story.append(Paragraph("Sacred Islamic Supplication", self.styles['title']))
            story.append(Paragraph("Generated by BarakahTool Enterprise", self.styles['subtitle']))
            story.append(Spacer(1, 20))
            
            # Situation section
            story.append(Paragraph(f"<b>Your Request:</b>", self.styles['guidance']))
            story.append(Paragraph(situation, self.styles['guidance']))
            story.append(Spacer(1, 15))
            
            # Arabic section with background
            arabic_text = self.format_arabic_text(dua_data.get('arabic', ''))
            story.append(Paragraph("Arabic Supplication", self.styles['subtitle']))
            
            # Create table for Arabic text with background
            arabic_table_data = [[Paragraph(arabic_text, self.styles['arabic'])]]
            arabic_table = Table(arabic_table_data, colWidths=[6*inch])
            arabic_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), self.colors['background']),
                ('BORDER', (0, 0), (-1, -1), 2, self.colors['border']),
                ('PADDING', (0, 0), (-1, -1), 15),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(arabic_table)
            story.append(Spacer(1, 20))
            
            # Transliteration section
            if dua_data.get('transliteration'):
                story.append(Paragraph("Pronunciation Guide", self.styles['subtitle']))
                transliteration_table_data = [[Paragraph(dua_data['transliteration'], self.styles['transliteration'])]]
                transliteration_table = Table(transliteration_table_data, colWidths=[6*inch])
                transliteration_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), HexColor('#f0fff0')),
                    ('BORDER', (0, 0), (-1, -1), 1, self.colors['secondary']),
                    ('PADDING', (0, 0), (-1, -1), 12),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ]))
                story.append(transliteration_table)
                story.append(Spacer(1, 15))
            
            # Translation section
            story.append(Paragraph("English Translation", self.styles['subtitle']))
            translation_text = f'"{dua_data.get("translation", "")}"'
            translation_table_data = [[Paragraph(translation_text, self.styles['translation'])]]
            translation_table = Table(translation_table_data, colWidths=[6*inch])
            translation_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#fff0f5')),
                ('BORDER', (0, 0), (-1, -1), 1, self.colors['accent']),
                ('PADDING', (0, 0), (-1, -1), 15),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ]))
            story.append(translation_table)
            story.append(Spacer(1, 20))
            
            # Spiritual guidance section
            story.append(Paragraph("Spiritual Guidance", self.styles['subtitle']))
            guidance_points = [
                "• Best times: Last third of the night, between Adhan & Iqamah",
                "• Recite with complete sincerity and trust in Allah's mercy",
                "• Recommended repetitions: 3, 7, 11, or 33 times",
                "• Maintain wudu and face Qiblah for maximum blessing",
                "• Follow with personal supplications in your native language"
            ]
            
            guidance_table_data = []
            for point in guidance_points:
                guidance_table_data.append([Paragraph(point, self.styles['guidance'])])
            
            guidance_table = Table(guidance_table_data, colWidths=[6*inch])
            guidance_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#f0ffff')),
                ('BORDER', (0, 0), (-1, -1), 1, HexColor('#006B6B')),
                ('PADDING', (0, 0), (-1, -1), 8),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ]))
            story.append(guidance_table)
            story.append(Spacer(1, 30))
            
            # Footer
            story.append(Paragraph("May Allah accept your supplication and grant you success", self.styles['footer']))
            story.append(Paragraph("BarakahTool Enterprise - Premium Islamic Digital Platform", self.styles['footer']))
            story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", self.styles['footer']))
            
            # Build PDF with custom page template
            doc.build(story, onFirstPage=self._add_page_decorations, onLaterPages=self._add_page_decorations)
            
            print(f"✅ Enterprise PDF generated successfully: {output_path}")
            return True
            
        except Exception as e:
            print(f"❌ PDF generation failed: {str(e)}")
            
            # Create fallback simple PDF
            await self._create_fallback_pdf(dua_data, situation, output_path)
            return False
    
    def _add_page_decorations(self, canvas_obj, doc):
        """Add decorative elements to each page"""
        self.draw_decorative_border(canvas_obj, doc)
        self.add_header_decoration(canvas_obj)
        
        # Add page number
        width, height = A4
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColor(self.colors['text'])
        canvas_obj.drawCentredText(width/2, 0.5*inch, f"Page {canvas_obj.getPageNumber()}")
    
    async def _create_fallback_pdf(self, dua_data: dict, situation: str, output_path: str):
        """Create a simple fallback PDF if main generation fails"""
        try:
            from reportlab.pdfgen import canvas
            c = canvas.Canvas(output_path, pagesize=A4)
            width, height = A4
            
            # Simple layout
            c.setFont('Helvetica-Bold', 20)
            c.drawCentredText(width/2, height - 100, "BarakahTool - Islamic Dua")
            
            c.setFont('Helvetica', 12)
            c.drawCentredText(width/2, height - 140, f"Situation: {situation}")
            
            c.setFont('Helvetica-Bold', 16)
            c.drawCentredText(width/2, height - 200, "Arabic:")
            c.drawCentredText(width/2, height - 230, dua_data.get('arabic', 'Arabic text'))
            
            if dua_data.get('transliteration'):
                c.setFont('Helvetica-Oblique', 14)
                c.drawCentredText(width/2, height - 280, "Pronunciation:")
                c.drawCentredText(width/2, height - 300, dua_data['transliteration'])
            
            c.setFont('Helvetica', 12)
            c.drawCentredText(width/2, height - 350, "Translation:")
            c.drawCentredText(width/2, height - 380, dua_data.get('translation', 'Translation'))
            
            c.setFont('Helvetica-Bold', 10)
            c.drawCentredText(width/2, height - 450, "BarakahTool Enterprise Platform")
            
            c.save()
            print(f"✅ Fallback PDF created: {output_path}")
            
        except Exception as e:
            print(f"❌ Even fallback PDF failed: {str(e)}")

# Create singleton instance
enterprise_pdf_generator = EnterprisePDFGenerator()