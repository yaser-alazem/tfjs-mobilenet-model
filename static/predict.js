$('#image-selector').change(function() {
  let reader = new FileReader();
  reader.onload = function() {
    let dataURL = reader.result;
    $('#selected-image').attr('src', dataURL);
    $('#prediction-list').empty();
  };
  let file = $('#image-selector').prop('files')[0];
  reader.readAsDataURL(file);

  let model;
  (async function() {
    model = undefined;
    model = await tf.loadModel(
      'http://127.0.0.1:5000/tfjs-models/MobileNet/model.json'
    );
    $('.progress-bar').hide();
  })();
});

$('#predict-button').click(async function() {
  let image = $('#selected-image').get(0);
  let tensor = tf
    .fromPixels(image)
    .resizeNearestNeighbor([224, 224])
    .toFloat();
  let offset = tf.scalar(127.5);

  tensor = tensor
    .sub(offset)
    .div(offset)
    .expandDims();

  let predictions = await model.predict(tensor).data();
  let topFive = Array.from(predictions)
    .map(function(prediction, index) {
      return {
        probability: prediction,
        className: IMAGENET_CLASSES[index]
      };
    })
    .sort(function(a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 5);

  $('#prediction-list').empty();
  topFive.forEach(function(p) {
    $('#prediction-list').append(
      `<li>${p.className}: ${p.probability.toFixed(6)}</li>`
    );
  });
});
