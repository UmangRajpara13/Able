import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-core'
import * as fs from 'fs'
import * as path from 'path'

// Define the directory path containing the JSON files
const dataDir = path.join('./able_store/Gen3');

// // Define the lists to store the sentences and labels
const allSentences = [];
const labels = [];

// // Walk through the directory recursively
fs.readdirSync(dataDir, { withFileTypes: true }).forEach(dirent => {
  // console.log(dirent)
  if (dirent.isFile()) {
    console.log(dirent,Object.keys(dirent), );

    // Read the JSON file
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, dirent.name), 'utf8'));

    // Get the name of the top-level key
    const topLevelKey = 'global';
    console.log(topLevelKey);

    // Get the sentences for this topLeveKey
    for (const [intent, sentences] of Object.entries(data[topLevelKey])) {
      for (const sentence of sentences.paraphrases) {
        allSentences.push(sentence);
        labels.push(intent);
      }
    }

    if (dirent.name !== 'global.json') {
      const topLevelKey = 'onActiveWindow';
      console.log(topLevelKey);

      // Get the sentences for this topLeveKey
      for (const [intent, sentences] of Object.entries(data[topLevelKey])) {
        for (const sentence of sentences.paraphrases) {
          allSentences.push(sentence);
          labels.push(intent);
        }
      }
    }
  }
});


console.log(allSentences);

// // Tokenize the sentences
// var myTokenizer = new tf.keras.preprocessing.text.Tokenizer();
// myTokenizer.fitOnTexts(allSentences);
// const sequences = myTokenizer.textsToSequences(allSentences);
// const wordIndex = myTokenizer.wordIndex;

// // Pad the sequences
// const maxlen = 20;
// const paddedSequences = tf.keras.preprocessing.sequence.padSequences(sequences, { padding: 'post', maxlen: maxlen });
// console.log(paddedSequences, paddedSequences.length);

// // One-hot encode the labels
// const numClasses = new Set(labels).size;
// const labelIndex = Object.fromEntries([...new Set(labels)].map((label, i) => [label, i]));
// const encodedLabels = labels.map(label => labelIndex[label]);
// console.log(encodedLabels, encodedLabels.length, numClasses);



// // Convert the encoded labels to one-hot encoded labels
// const one_hot_labels = tf.oneHot(encodedLabels, numClasses);

// // Save the myTokenizer
// fs.writeFileSync('tokenizer.json', JSON.stringify(myTokenizer));

// // Save the label index
// fs.writeFileSync('label_index.json', JSON.stringify(label_index));

// // Split the data into training and testing sets
// const split_index = Math.floor(paddedSequences.length * 0.8);
// const train_data = paddedSequences.slice(0, split_index);
// const train_labels = one_hot_labels.slice(0, split_index);
// const test_data = paddedSequences.slice(split_index);
// const test_labels = one_hot_labels.slice(split_index);

// // Define callbacks
// const checkpoint = tf.keras.callbacks.ModelCheckpoint('model/model.h5', {
//   monitor: 'accuracy',
//   save_best_only: true,
//   mode: 'max'
// });
// const early_stop = tf.keras.callbacks.EarlyStopping({
//   monitor: 'accuracy',
//   min_delta: 0,
//   patience: 1000,
//   mode: 'max',
//   verbose: 1
// });

// // Build the model
// const model = tf.keras.Sequential();
// model.add(tf.keras.layers.Embedding(wordIndex + 1, 256, { inputLength: maxlen }));
// model.add(tf.keras.layers.LSTM(256, { returnSequences: true }));
// model.add(tf.keras.layers.Dropout(0.5));
// model.add(tf.keras.layers.LSTM(256));
// model.add(tf.keras.layers.Dropout(0.5));
// model.add(tf.keras.layers.Dense(numClasses, { activation: 'softmax' }));

// model.compile({ loss: 'categorical_crossentropy', optimizer: 'adam', metrics: ['accuracy'] });

// // Train the model with callbacks
// const history = await model.fit(train_data, train_labels, {
//   validation_data: [test_data, test_labels],
//   epochs: 400,
//   batch_size: 32,
//   callbacks: [early_stop, checkpoint]
// });

// Plot the training and validation accuracy for each epoch
// const plt = require('matplotlib.pyplot');
// plt.plot(history.history['accuracy']);
// plt.ylabel('accuracy');
// plt.xlabel('Epoch');
// plt.show();

// Load the myTokenizer

// const myTokenizer = jsPickle.loads(fs.readFileSync('./tokenizer.json'));

// Load the label index
// const label_index = jsPickle.loads(fs.readFileSync('./label_index.json'));

// // Load the trained model
// const loaded_model = await tf.keras.models.load_model('model/model.h5');

// // Use the model to predict the intent of new sentences
// const new_sentences = ["lets review my work"];
// const new_sequences = myTokenizer.texts_to_sequences(new_sentences);
// const new_padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(new_sequences, { padding: 'post', maxlen: MAX_LEN });
// const predictions = loaded_model.predict(new_padded_sequences);
// const predicted_labels = predictions.map(prediction => Object.keys(label_index)[Object.values(label_index).indexOf(tf.argMax(prediction).dataSync()[0])]);
// console.log(predicted_labels);