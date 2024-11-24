import { Fontisto, AntDesign } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React from 'react'
import { TouchableOpacity, SafeAreaView, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';


const handleSubmitPhoto = async (photo: CameraCapturedPicture) => {
  console.log("handleSubmitPhoto called");
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    } as any);
  
    try {
      const response = await axios.post('http://10.44.203.175:5000/parse-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Navigate to a results screen with the parsed data
      router.push({
        pathname: '/splitter',
        params: { items: JSON.stringify(response.data.items) },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
          console.error('Axios Error:', error.message);
          console.error('Error Code:', error.code);
          console.error('Error Config:', error.config);
      } else {
        console.error('Unknown Error:', error);
      }
    }    
  };

const PhotoPreviewSection = ({
    photo,
    handleRetakePhoto,
}: {
    photo: CameraCapturedPicture;
    handleRetakePhoto: () => void;
}) => (
    <SafeAreaView style={styles.container}>
        <View style={styles.box}>
            <Image
                style={styles.previewConatiner}
                source={{uri: 'data:image/jpg;base64,' + photo.base64}}
            />
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
                <Fontisto name='trash' size={36} color='black' />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleSubmitPhoto(photo)}>
                <AntDesign name="arrowright" size={36} color="black" />
          </TouchableOpacity>
        </View>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        borderRadius: 15,
        padding: 1,
        width: '95%',
        backgroundColor: 'darkgray',
        justifyContent: 'center',
        alignItems: "center",
    },
    previewConatiner: {
        width: '95%',
        height: '85%',
        borderRadius: 15
    },
    buttonContainer: {
        marginTop: '4%',
        flexDirection: 'row',
        justifyContent: "center",
        width: '100%',
    },
    button: {
        backgroundColor: 'gray',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }

});

export default PhotoPreviewSection;