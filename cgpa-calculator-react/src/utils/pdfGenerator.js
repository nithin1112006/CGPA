import jsPDF from 'jspdf';
import { isBlendedSubject } from './subjectUtils';

// Table drawing function with borders and alignment
const drawTable = (doc, startY, headers, rows) => {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const tableWidth = pageWidth - (margin * 2);
    // Adjusted widths to match user request (Subject: 52%, Others: 16% each)
    const colWidths = [tableWidth * 0.52, tableWidth * 0.16, tableWidth * 0.16, tableWidth * 0.16];

    let yPos = startY;
    const rowHeight = 7.5;
    const cellPadding = 2;

    // Header styling
    doc.setFillColor(31, 240, 31); // Lighter Green table header bg
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);

    // Draw Header Background
    doc.rect(margin, yPos, tableWidth, rowHeight, 'F');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);

    let xPos = margin;
    headers.forEach((header, i) => {
        // Draw Header Border
        doc.rect(xPos, yPos, colWidths[i], rowHeight, 'S');

        let align = 'left';
        let textX = xPos + cellPadding;
        if (i > 0) {
            align = 'center';
            textX = xPos + (colWidths[i] / 2);
        }

        doc.text(header, textX, yPos + rowHeight / 1.5, { align });
        xPos += colWidths[i];
    });

    yPos += rowHeight;

    // Body rows
    doc.setFont(undefined, 'normal');
    rows.forEach((row, rowIndex) => {
        const isTotal = rowIndex === rows.length - 1;

        if (isTotal) {
            doc.setFont(undefined, 'bold');
        }

        xPos = margin;
        row.forEach((cell, i) => {
            // Draw Cell Border
            doc.setDrawColor(0, 0, 0);
            doc.rect(xPos, yPos, colWidths[i], rowHeight, 'S');

            let align = 'left';
            let textX = xPos + cellPadding;

            if (i > 0) {
                align = 'center';
                textX = xPos + (colWidths[i] / 2);
            }

            if (isTotal && i === 0) {
                align = 'right';
                textX = xPos + colWidths[i] - cellPadding;
            }

            let text = String(cell);
            doc.text(text, textX, yPos + rowHeight / 1.5, { align, maxWidth: colWidths[i] - (cellPadding * 2) });
            xPos += colWidths[i];
        });

        yPos += rowHeight;
    });

    return yPos;
};

const imageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = url;
    });
};

export const generatePDF = async (username, semester, department, subjects, grades, sgpa, batch, regulation) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Load Images
        let logoBase64 = "";
        let naacBase64 = "";
        try {
            [logoBase64, naacBase64] = await Promise.all([
                imageToBase64("/images/logo.png"),
                imageToBase64("/images/Naac logo")
            ]);
        } catch (err) {
            console.warn("Logos failed to load", err);
        }

        // Watermark (Center Page - Larger)
        if (logoBase64) {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.05 }));
            const watermarkSize = 140;
            doc.addImage(logoBase64, 'PNG', pageWidth / 2 - watermarkSize / 2, pageHeight / 2 - watermarkSize / 2, watermarkSize, watermarkSize);
            doc.restoreGraphicsState();
        }

        // Logos in Header - Fixed positioning and dimensions
        const leftLogoSize = 20;
        const leftX = 12;
        const leftY = 10;

        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', leftX, leftY, leftLogoSize, leftLogoSize);
            
            // Tagline below left logo
            doc.setFontSize(6);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text("", leftX + leftLogoSize/2, leftY + leftLogoSize + 4, { align: "center" });
            doc.text("", leftX + leftLogoSize/2, leftY + leftLogoSize + 7, { align: "center" });
        }

        // NAAC Logo - Fixed dimensions (taller aspect ratio for badge with ribbon)
        const naacWidth = 22;
        const naacHeight = 26;
        const naacX = pageWidth - naacWidth - 12;
        const naacY = 10;

        if (naacBase64) {
            doc.addImage(naacBase64, 'PNG', naacX, naacY, naacWidth, naacHeight);
        }

        // College Header - Vertically centered between logos
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text("Sri Shakthi Institute of Engineering and Technology", pageWidth / 2, 18, { align: "center" });

        doc.setFontSize(11);
        doc.text("(An Autonomous Institution)", pageWidth / 2, 25, { align: "center" });

        // Details Section (Structured Table Format) - Moved down to accommodate tagline
        doc.setFontSize(10);
        const infoTableWidth = 140;
        const infoStartX = (pageWidth - infoTableWidth) / 2;
        let infoY = 42;
        const infoRowHeight = 7;
        const infoColWidth = infoTableWidth / 2;

        const infoFields = [
            { label: 'Department', value: department },
            { label: 'Regulation', value: regulation < 100 ? 2000 + regulation : regulation },
            { label: 'Semester', value: semester },
            { label: 'Register Number', value: username }
        ];

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);

        infoFields.forEach((field, index) => {
            // Draw Row Box
            doc.rect(infoStartX, infoY, infoTableWidth, infoRowHeight, 'S');
            // Draw Middle Divider
            doc.line(infoStartX + infoColWidth, infoY, infoStartX + infoColWidth, infoY + infoRowHeight);

            doc.setFont(undefined, 'bold');
            doc.text(`${field.label}:`, infoStartX + 4, infoY + 4.5);

            doc.setFont(undefined, 'normal');
            doc.text(String(field.value), infoStartX + infoColWidth + 4, infoY + 4.5);

            infoY += infoRowHeight;
        });

        let tableStartY = infoY + 8;

        // Table Data Construction
        const tableData = subjects.map(subject => {
            const gradePoint = grades[subject._id] || "0";
            const gradeLetter = gradePoint === "10" ? "O" :
                gradePoint === "9" ? "A+" :
                    gradePoint === "8" ? "A" :
                        gradePoint === "7" ? "B+" :
                            gradePoint === "6" ? "B" :
                                gradePoint === "5" ? "C+" :
                                    gradePoint === "4" ? "C" : "U";

            const displayCredit = gradePoint === "0" ? "-" : subject.credit;

            // Add (Blended) text if applicable
            let label = subject.label;
            if (isBlendedSubject(label)) {
                label += " (Blended)";
            }

            return [label, gradeLetter, gradePoint, displayCredit];
        });

        const totalCredits = subjects.reduce((sum, s) => {
            const gradePoint = grades[s._id] || "0";
            return gradePoint !== "0" ? sum + s.credit : sum;
        }, 0);

        tableData.push(['Total Credits', '', '', totalCredits.toString()]);

        const headers = ['Subject', 'Grade (Letter)', 'Grade (Point)', 'Credit'];
        const finalY = drawTable(doc, tableStartY, headers, tableData);

        // Final SGPA
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`Your SGPA is: ${sgpa}`, pageWidth / 2, finalY + 12, { align: "center" });

        doc.save(`${username}_SGPA_Report.pdf`);
        return true;
    } catch (err) {
        console.error('Error generating PDF:', err);
        throw err;
    }
};