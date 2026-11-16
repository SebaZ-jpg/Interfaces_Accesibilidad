// Mantiene public/index.html como portada sin usar una reescritura de Next.js.
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/index.html',
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
