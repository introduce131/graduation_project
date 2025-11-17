import { QRCodeCanvas } from "qrcode.react";
import Header from "./공용/1.header/Header";

export default function MyQR() {
  const url = "https://localhost:3000"; // 여기에 네 앱 URL

  return (
    <div>
        <Header/>
      <h2>앱 접속 QR</h2>
      <QRCodeCanvas value={url} size={200} />
    </div>
  );
}

export { MyQR };