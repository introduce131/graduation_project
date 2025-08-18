import logo from '../../../images/logo/로고.png';
import css from '../../../css/style.scss'
import { Link } from 'react-router-dom';

function Header(){
    return(
        <header>
           
            <Link to = '/' className='header-wrap'>
                <img src={logo} alt="로고" />
                <p>오늘 뭐할까?</p>
            </Link>
            
        </header>
    )
}


export default Header;