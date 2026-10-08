"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, QrCode, Smartphone } from "lucide-react";
import { Modal } from "./ui";

export function QrCollector({
  networkUrl,
  onClose,
}: {
  networkUrl?: string;
  onClose: () => void;
}) {
  const [image, setImage] = useState("");
  const [error, setError] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    const target = networkUrl || `${location.origin}/ponto`;
    setUrl(target);
    import("qrcode")
      .then((qr) =>
        qr.toDataURL(target, {
          width: 300,
          margin: 2,
          color: { dark: "#214b3b", light: "#ffffff" },
          errorCorrectionLevel: "M",
        }),
      )
      .then((data) => {
        if (active) setImage(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [networkUrl]);
  return (
    <Modal
      title="Escaneou. Confirmou. Pronto."
      description="O QR abre a tela simples do funcionário. O horário é preenchido automaticamente."
      onClose={onClose}
    >
      <div className="qr-sheet">
        <span className="qr-caption">
          <QrCode size={17} /> PONTO DA FAZENDA
        </span>
        {image ? (
          <img
            src={image}
            width={260}
            height={260}
            alt="QR Code para abrir o ponto da Fazenda Limoeiro"
          />
        ) : (
          <p>
            {error
              ? "Não foi possível gerar o QR. Use o botão abaixo."
              : "Preparando QR…"}
          </p>
        )}
        <h3>Aponte a câmera do celular</h3>
        <p>
          Escolha seu nome na tela.
          <br />
          Depois, basta confirmar a batida.
        </p>
      </div>
      <a
        className="button primary full-width"
        href="/ponto"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Smartphone size={18} /> Abrir tela do funcionário{" "}
        <ArrowUpRight size={17} />
      </a>
      <div className="qr-demo-notes">
        <strong>Para experimentar</strong>
        <p>
          Escolha <b>João Ferreira</b> para experimentar. Sem login ou senha; o
          relógio fictício avança sozinho a cada batida.
        </p>
        <p>
          {networkUrl
            ? "No celular, use a mesma rede Wi-Fi deste computador. O endereço local depende de o computador estar ligado e acessível na rede."
            : "O QR precisa de um endereço acessível no celular. Em localhost, use o botão acima neste computador."}
        </p>
        <p>
          Dados de teste ficam em cada navegador. Para ver a batida atualizar o
          painel, abra as duas telas no mesmo navegador e endereço.
        </p>
        <small className="qr-url">{url}</small>
      </div>
    </Modal>
  );
}
