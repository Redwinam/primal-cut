import { readFiles } from 'h3-formidable';
import sharp from 'sharp';
import * as png2icons from 'png2icons';
import JSZip from 'jszip';

export default defineEventHandler(async (event) => {
    const { fields, files } = await readFiles(event, {
        includeFields: true,
    });

    const file = files.file?.[0];
    const type = fields.type?.[0];

    if (!file) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded',
        });
    }

    const buffer = await fs.promises.readFile(file.filepath);
    const originalName = file.originalFilename || 'image.png';
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    if (type === 'icns') {
        // Process image with sharp for ICNS
        const processedBuffer = await sharp(buffer)
            .resize({
                width: 1024,
                height: 1024,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .composite([
                {
                    input: Buffer.from(
                        `<svg><rect x="0" y="0" width="1024" height="1024" rx="250" ry="250" /></svg>`
                    ),
                    blend: 'dest-in',
                },
            ])
            .extend({
                top: 120,
                bottom: 120,
                left: 120,
                right: 120,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer();

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
            const resizedBuffer = await sharp(buffer)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                })
                .png()
                .toBuffer();

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

import fs from 'node:fs';
