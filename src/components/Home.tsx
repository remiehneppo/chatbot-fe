import { Card } from 'antd';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Home.css';

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const banners = [
    '/banners/banner_1.jpg',
    '/banners/banner_2.jpg',
    '/banners/banner_3.jpg',
    // Thêm các banner khác tại đây
  ];

  return (
    <Card title="Trang chủ">
      <div className="banner-slider">
        <Slider {...settings}>
          {banners.map((banner, index) => (
            <div key={index}>
              <img 
                src={banner} 
                alt={`Banner ${index + 1}`}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </Slider>
      </div>
      <p>Chào mừng đến với hệ thống</p>
    </Card>
  );
};

export default Home;