const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

async function generateCertificate(userData) {
    const {
        studentName,
        courseName,
        completionDate,
        certificateId,
        courseLevel,
        duration
    } = userData;

    // Create canvas
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Load certificate template
    const template = await loadImage(path.join(process.cwd(), 'public/certif.jpg'));
    ctx.drawImage(template, 0, 0, 1920, 1080);

    // Configure text styles
    ctx.textAlign = 'center';
    
    // Draw certificate content
    // Certificate Title
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#1a365d';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 300);

    // Student Name
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#2d3748';
    ctx.fillText(studentName, canvas.width / 2, 450);

    // Course Name
    ctx.font = '36px Arial';
    ctx.fillStyle = '#4a5568';
    ctx.fillText(`Has successfully completed the course`, canvas.width / 2, 520);
    ctx.font = 'bold 42px Arial';
    ctx.fillText(courseName, canvas.width / 2, 580);

    // Course Details
    ctx.font = '24px Arial';
    ctx.fillText(`Level: ${courseLevel} | Duration: ${duration}`, canvas.width / 2, 640);

    // Date and Certificate ID
    ctx.font = '20px Arial';
    ctx.fillStyle = '#718096';
    ctx.fillText(`Completion Date: ${completionDate}`, canvas.width / 2, 700);
    ctx.fillText(`Certificate ID: ${certificateId}`, canvas.width / 2, 730);

    // Return the canvas buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
}

module.exports = { generateCertificate };
