/**
 * 图片转Base64工具
 * 用于将图片文件转换为base64编码，方便在Markdown中使用
 */

/**
 * 将图片文件转换为base64编码
 * @param file 图片文件
 * @returns Promise<string> base64编码的图片数据URL
 */
export async function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('文件读取失败'));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 从URL获取图片并转换为base64（需要服务器支持CORS）
 * @param url 图片URL
 * @returns Promise<string> base64编码的图片数据URL
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('图片转换失败'));
        }
      };

      reader.onerror = () => {
        reject(new Error('图片转换失败'));
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`图片下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}