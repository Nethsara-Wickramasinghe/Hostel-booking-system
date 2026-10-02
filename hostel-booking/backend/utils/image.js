// Images are stored as "/uploads/<file>" and returned to the app as absolute URLs.
const imageUrl = (req, p) => (p ? `${req.protocol}://${req.get('host')}${p}` : '');
const withImage = (req, doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  o.image = imageUrl(req, o.image);
  return o;
};
module.exports = { imageUrl, withImage };
