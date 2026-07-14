export interface StockImage {
  id: string;
  label: string;
  url: string;
  thumbUrl: string;
}

const STOCK_IMAGE_SOURCES: { id: string; label: string }[] = [
  { id: '1512453979798-5ea266f8880c', label: 'Dubai Marina skyline' },
  { id: '1518684079-3c830dcef090', label: 'Dubai skyline at dusk' },
  { id: '1580060839134-75a5edca2e99', label: 'Burj Khalifa' },
  { id: '1580674684081-7617fbf3d745', label: 'Dubai skyscrapers' },
  { id: '1512632578888-169bbbc64f33', label: 'Dubai skyline at night' },
  { id: '1546412414-8035e1776c9a', label: 'Burj Khalifa close-up' },
  { id: '1489515217757-5fd1be406fef', label: 'Dubai architecture' },
  { id: '1533628635777-112b2239b1c7', label: 'Dubai downtown' },
  { id: '1590283603385-17ffb3a7f29f', label: 'Trading floor' },
  { id: '1611974789855-9c2a0a7236a3', label: 'Stock market screens' },
  { id: '1590486803833-1c5dc8ddd4c8', label: 'Finance chart' },
  { id: '1567427017947-545c5f8d16ad', label: 'Stock market candles' },
  { id: '1554260570-e9689a3418b8', label: 'Financial data' },
  { id: '1526304640581-d334cdbbf45e', label: 'City finance district' },
  { id: '1497366216548-37526070297c', label: 'Finance office' },
  { id: '1486406146926-c627a92ad1ab', label: 'Finance abstract' },
  { id: '1444653614773-995cb1ef9efa', label: 'Business office' },
  { id: '1470723710355-95304d8aece4', label: 'Business meeting' },
  { id: '1560472354-b33ff0c44a43', label: 'Corporate building' },
];

export const STOCK_IMAGES: StockImage[] = STOCK_IMAGE_SOURCES.map(({ id, label }) => ({
  id,
  label,
  url: `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`,
  thumbUrl: `https://images.unsplash.com/photo-${id}?w=200&h=140&q=60&auto=format&fit=crop`,
}));
