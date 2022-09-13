const Jimp = require('jimp')

class Imager {
    #image = null;
    #imageWidth
    #imageHeight
    #backgroundColor
    constructor(width, height, backgroundColor) {
        this.#image = new Jimp(width, height, backgroundColor, (err, image) => {
            if (err) throw err
        })
        this.#imageWidth = width;
        this.#imageHeight = height;
        this.#backgroundColor = backgroundColor;
    }
    /**
     * Writes text at the center of the image
     * @param {String} text Text you want to write over the image
     * @returns {Object} image with text overlay
     */
    async write(text) {
        const WRITE_X_LOCATION = 0.1 * this.#imageWidth; //Start writing at 1% right
        const WRITE_Y_LOCATION = 0
        let loadFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
        if (loadFont) {
            let textOverImage = await this.#image.print(loadFont, WRITE_X_LOCATION, WRITE_Y_LOCATION, {
                text: text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
                this.#imageWidth - (0.2 * this.#imageWidth), // Stop writing at 2% less than image width
                this.#imageHeight
            );
            return textOverImage;
        }
        return null;
    }
    /**
     * Get Current state of image
     * @returns current state of image
     */
    getImage() {
        return this.#image;
    }
}

module.exports = {
    Imager: new Imager(1920, 1080, 'black'),
    /**
     * Save Image to file
     * @param {Object} image Image instance you want to save to file
     * @param {String} name What do you want to name the file? No extensions
     * @param {String} path Where do you want it to save?
     * @returns {Object} ImageBuffer
     */
    Save: async (image, name, path) => {
        let file = path + name + `.${image.getExtension()}`
        return await image.write(file)
    }
};