export const genererLienWhatsApp = (numeroWhatsapp, nomDon) => {
  const numero  = numeroWhatsapp?.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Bonjour ! Je vous contacte via Kollecta concernant votre annonce : "${nomDon}".`
  );
  return `https://wa.me/${numero}?text=${message}`;
};

export const formaterPrix = (prix) => {
  return prix?.toLocaleString('fr-SN') + ' FCFA';
};

export const formaterDate = (date) => {
  return new Date(date).toLocaleDateString('fr-SN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};
