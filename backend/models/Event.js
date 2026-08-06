const mongoose = require('mongoose');

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    image: { type: String },
    ticketPrice: { type: Number, required: true, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-generate unique slug before validation
eventSchema.pre('validate', async function (next) {
    if (this.title && (!this.slug || this.isModified('title'))) {
        let generatedSlug = slugify(this.title);
        
        const EventModel = this.constructor;
        let count = 0;
        let uniqueSlug = generatedSlug;
        
        while (true) {
            const existing = await EventModel.findOne({ slug: uniqueSlug, _id: { $ne: this._id } });
            if (!existing) {
                break;
            }
            count++;
            uniqueSlug = `${generatedSlug}-${count}`;
        }
        this.slug = uniqueSlug;
    }
    next();
});

module.exports = mongoose.model('Event', eventSchema);
