# SuperSafe Wallet

Una extensión de billetera minimalista para la blockchain SuperSeed, compatible con redes EVM.

## Características

- **Multi-red**: Compatible con SuperSeed Mainnet (ID Cadena 5330) y Devnet Sepolia (ID Cadena 53302).
- **Gestión de cuentas**: Importa billeteras usando frase semilla o clave privada, con la capacidad de asignar un alias personalizado.
- **Mostrar saldos**: Muestra saldos de ETH nativo y tokens ERC-20 predeterminados (USDC y USDT) para la cuenta seleccionada.
- **Transacciones recientes**: Muestra las últimas 10 transacciones (enviadas o recibidas) para la billetera activa.
- **Transferencias de tokens**: Permite enviar ETH o cualquier token ERC-20 agregado a otra dirección.
- **Tokens personalizados**: Permite agregar manualmente contratos de tokens ERC-20 personalizados para rastrear tokens adicionales.
- **Integración con Explorer**: Proporciona un enlace para ver la dirección de la billetera actual en el explorador SuperSeed.
- **Almacenamiento seguro**: Almacena de forma segura los datos sensibles (claves privadas, frases semilla) en el navegador utilizando cifrado fuerte (AES-GCM).

## Tecnologías

- React
- TailwindCSS
- Vite
- ethers.js
- IndexedDB (idb)

## Desarrollo

### Requisitos previos

- Node.js 14 o superior
- npm 7 o superior

### Configuración

1. Clona este repositorio:
```
git clone https://github.com/yourusername/SuperSafe.git
cd SuperSafe
```

2. Instala las dependencias:
```
npm install
```

3. Inicia el servidor de desarrollo:
```
npm run dev
```

### Construir para producción

```
npm run build
```

La extensión empaquetada estará en la carpeta `dist`.

### Cargar la extensión en Chrome

1. Abre Chrome y navega a `chrome://extensions/`
2. Habilita el "Modo de desarrollador" (toggle en la parte superior derecha)
3. Haz clic en "Cargar descomprimida" y selecciona la carpeta `dist`

## Licencia

[MIT](LICENSE)
