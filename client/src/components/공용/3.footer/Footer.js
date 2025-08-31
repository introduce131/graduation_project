import home from '../../../images/icon/home.png';
import user from '../../../images/icon/user.png';
import compass from '../../../images/icon/compass.png';
import heart from '../../../images/icon/heart.png';

import css from '../../../css/style.scss'

import ImageHover from './ImageHover';
import homeHover from '../../../images/icon/home_color.png'
import userHover from '../../../images/icon/user_color.png';
import compassHover from '../../../images/icon/compass_color.png';
import heartHover from '../../../images/icon/heart_color.png';



function Footer() {
    return (
      <footer>
        <ul>
          <ImageHover defaultImg={home} hoverImg={homeHover} label="홈" to="/" />
          <ImageHover defaultImg={heart} hoverImg={heartHover} label="즐겨찾기" to="/myfavorites" />
          <ImageHover defaultImg={compass} hoverImg={compassHover} label="코스" to="/budget" />
          <ImageHover defaultImg={user} hoverImg={userHover} label="MY" to="/mypage" />
        </ul>
      </footer>
    );
  }
  
export default Footer;