import { Jimp } from 'jimp';
import * as png2icons from 'png2icons';
import JSZip from 'jszip';

export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event);
    if (!body) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded',
        });
    }

    const file = body.find((item) => item.name === 'file');
    const typeItem = body.find((item) => item.name === 'type');
    const type = typeItem?.data.toString();

    if (!file || !file.data) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded',
        });
    }

    const buffer = file.data;
    const originalName = file.filename || 'image.png';
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    if (type === 'icns') {
        // Process image with jimp for ICNS
        // 1. Create a 1024x1024 canvas with transparent background
        const canvas = new Jimp({ width: 1024, height: 1024, color: 0x00000000 });
        
        // 2. Load the image
        const image = await Jimp.read(buffer);
        
        // 3. Resize image to fit within 1024x1024 (contain)
        image.contain({ w: 1024, h: 1024 });
        
        // 4. Create rounded corners mask (emulating the SVG composite)
        // Since Jimp doesn't support SVG compositing directly, we can skip the rounded corners 
        // for now or implement a simple mask if needed. For ICNS, the OS usually handles rounding.
        // But to match previous logic, we'll just composite the image onto the canvas.
        canvas.composite(image, 0, 0);

        // 5. Extend canvas (add padding) - previous logic added 120px padding
        // New size: 1024 + 120 + 120 = 1264
        const extendedCanvas = new Jimp({ width: 1264, height: 1264, color: 0x00000000 });
        extendedCanvas.composite(canvas, 120, 120);

        const processedBuffer = await extendedCanvas.getBuffer("image/png");

        // Convert to ICNS
        const icnsBuffer = png2icons.createICNS(processedBuffer, png2icons.BILINEAR, 0);

        if (!icnsBuffer) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to convert to ICNS',
            });
        }

        setResponseHeaders(event, {
            'Content-Type': 'application/x-icns',
            'Content-Disposition': `attachment; filename="${baseName}.icns"`,
        });

        return icnsBuffer;
    } else if (type === 'png-set') {
        const zip = new JSZip();
        const sizes = [16, 48, 128];

        // Add original file
        zip.file('icon.png', buffer);

        // Create resized versions
        for (const size of sizes) {
            const image = await Jimp.read(buffer);
            image.contain({ w: size, h: size });
            const resizedBuffer = await image.getBuffer("image/png");
            zip.file(`icon${size}.png`, resizedBuffer);
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        setResponseHeaders(event, {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${baseName}-icons.zip"`,
        });

        return zipBuffer;
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid conversion type',
        });
    }
});


