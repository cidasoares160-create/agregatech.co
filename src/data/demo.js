export const STORE_ID = 'atelier-aura-demo';
export const STORAGE_KEY = `minha-loja:v1:${STORE_ID}`;
export const money = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJG2MISRcvyJMRPUi6_SsKkLU';
export const categories = ['Todos', 'Brincos', 'Colares', 'Pulseiras', 'Anéis', 'Acessórios'];
export const initialSettings = {
  name: 'Atelier Aura', tagline: 'Pequenos detalhes. Grandes histórias.', whatsapp: '',
  delivery: 'Entrega e retirada a combinar diretamente com a representante.',
  payment: 'Consulte as formas de pagamento com a representante. Nenhum pagamento é realizado neste site.',
};
const essentials = '/images/products-essentials.jpg';
const signature = '/images/products-signature.jpg';
const makeProduct = (id, name, category, price, originalPrice, stock, image, quadrant, extra = {}) => ({
  id, storeId: STORE_ID, name, category, price, originalPrice, stock, image, quadrant,
  active: true, featured: false, isNew: false,
  description: 'Um toque de elegância para acompanhar seus momentos. Peça demonstrativa com acabamento dourado e design delicado. As imagens são ilustrativas; materiais, medidas e disponibilidade devem ser confirmados com a representante.',
  ...extra,
});
export const initialProducts = [
  makeProduct('argola-elo', 'Argola Elo Dourada', 'Brincos', 5990, 7990, 12, essentials, 0, { featured: true, bestSeller: true, detail: 'Par de argolas • diâmetro demonstrativo de 2 cm' }),
  makeProduct('colar-perola', 'Colar Pérola Serena', 'Colares', 8990, 11990, 8, essentials, 1, { featured: true, detail: 'Corrente delicada • comprimento demonstrativo de 45 cm' }),
  makeProduct('bracelete-luna', 'Bracelete Luna', 'Pulseiras', 7490, 7490, 6, essentials, 2, { isNew: true, detail: 'Modelo aberto • ajuste delicado' }),
  makeProduct('anel-luz', 'Anel Ponto de Luz', 'Anéis', 4990, 6990, 15, essentials, 3, { bestSeller: true, detail: 'Aro demonstrativo 18 • confirme seu tamanho antes de pedir' }),
  makeProduct('brinco-esmeralda', 'Brinco Jardim', 'Brincos', 9990, 12990, 5, signature, 0, { featured: true, isNew: true, detail: 'Par de brincos • pedra verde ilustrativa' }),
  makeProduct('colar-estrela', 'Colar Céu de Estrelas', 'Colares', 7990, 7990, 9, signature, 1, { isNew: true, detail: 'Duas camadas • pingente em formato de estrela' }),
  makeProduct('pulseira-cristal', 'Pulseira Lumière', 'Pulseiras', 11990, 14990, 3, signature, 2, { featured: true, bestSeller: true, detail: 'Pedras transparentes • comprimento demonstrativo de 18 cm' }),
  makeProduct('anel-organico', 'Anel Orgânico Aura', 'Anéis', 6990, 8990, 7, signature, 3, { isNew: true, detail: 'Design escultural • aro demonstrativo 18' }),
  makeProduct('brinco-perola', 'Brinco Pérola Essencial', 'Brincos', 3990, 4990, 20, null, 0, { artwork: 'earrings', bestSeller: true, detail: 'Par de brincos • pérolas ilustrativas' }),
  makeProduct('colar-afeto', 'Colar Afeto', 'Colares', 6490, 8490, 11, null, 0, { artwork: 'necklace', detail: 'Pingente de coração • corrente demonstrativa de 45 cm' }),
  makeProduct('pulseira-encanto', 'Pulseira Encanto', 'Pulseiras', 5490, 5490, 4, null, 0, { artwork: 'bracelet', isNew: true, detail: 'Corrente com três pingentes • comprimento demonstrativo de 18 cm' }),
  makeProduct('presilha-dourada', 'Presilha Aurora', 'Acessórios', 3490, 4490, 0, null, 0, { artwork: 'barrette', detail: 'Acessório de cabelo • formato oval' }),
];
export function initialState() {
  return { version: 1, storeId: STORE_ID, settings: { ...initialSettings }, products: initialProducts, cart: [], orders: [] };
}
export function whatsappUrl(phone, text) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
export function validPhone(phone) {
  return /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
}
export function validStorePhone(phone) {
  return /^[1-9]\d{10,14}$/.test(phone.replace(/\D/g, ''));
}
