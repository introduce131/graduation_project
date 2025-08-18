import img from '../../../images/coupon/gay.jpg'
import css from '../../../css/pop_list.scss'

function Popular_spot_list({ storeName }) {
  
    return (
      <div className="wrap">
        <div className='info_wrap'>
          <img src={img} />
          <div className="info">
            <p className="title">{storeName}</p>
            <p>OO전문점</p>
            <p>534m/9999 ~ 99,999원</p>
          </div>
        </div>
      </div>
    )
  }

  export default Popular_spot_list;
  