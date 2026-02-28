/**
 * Image analysis handler — stub.
 *
 * Future implementation ideas:
 *  - Extract visible damage or work areas from a photo
 *  - Detect room type (kitchen, bathroom, etc.)
 *  - Annotate measurements from a marked-up image
 *
 * For now we return early so image uploads are silently ignored by the AI pipeline.
 *
 * @param {object} _event     - Cloud Storage onObjectFinalized event (unused)
 * @param {string} _projectId - (unused)
 * @param {string} _fileId    - (unused)
 */
async function handleImage(_event, _projectId, _fileId) {
  // TODO: implement image analysis
  return;
}

module.exports = { handleImage };
