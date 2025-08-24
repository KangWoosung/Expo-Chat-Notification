import { View, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useFileView } from "@/contexts/FileViewProvider";
import { WebView } from "react-native-webview";
import Pdf from "react-native-pdf";
import { Image } from "expo-image";

const FileViewer = () => {
  const { fileId, fileUrl, fileName, mimeType } = useFileView();
  const [fileType, setFileType] = useState<string>(mimeType);

  useEffect(() => {
    setFileType(mimeType);
    console.log("====FileViewer mimeType=====", mimeType);
    console.log("====FileViewer fileUrl=====", fileUrl);
  }, [mimeType]);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {fileType.startsWith("image/") ? (
        //* Image file *//
        <Image
          source={{ uri: fileUrl }}
          className="w-full h-full"
          contentFit="contain"
          cachePolicy="disk"
        />
      ) : fileType.startsWith("application/pdf") ? (
        //* PDF file *//
        <View style={{ flex: 1 }}>
          <Pdf
            source={{ uri: fileUrl }}
            style={{ flex: 1, width: Dimensions.get("window").width }}
          />
        </View>
      ) : (
        //* Office file *//
        <View style={{ flex: 1 }}>
          <WebView
            source={{
              uri: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                fileUrl
              )}`,
            }}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </View>
  );
};

export default FileViewer;
