import React, { Component } from "react";
import { connect } from "react-redux";
import "./Specialty.scss";
import { FormattedMessage } from "react-intl";
import { getAllSpecialty } from "../../../services/userService";

import Slider from "react-slick";
import { withRouter } from "react-router";

class Specialty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSpecialty: [],
    };
  }

  async componentDidMount() {
    let res = await getAllSpecialty(); // Lấy tất cả dữ liệu từ API
    if (res && res.errCode === 0) {
      this.setState({
        fullData: res.data ? res.data : [],
        dataSpecialty: res.data.slice(0, 4), // Hiển thị 4 phần tử đầu tiên
        offset: 4,
      });
    }
  }

  handleViewDetailSpecialty = (item) => {
    if (this.props.history) {
      this.props.history.push(`/detail-specialty/${item.id}`);
    }
  };

  handleClickSeeMoreSpecialty = () => {
    this.props.history.push(`/list-specialty`);
  };

  handleLoadMore = () => {
    let { fullData, dataSpecialty, offset } = this.state;
  
    // Nếu đã hiển thị đủ 12 specialty, dừng việc load thêm
    if (dataSpecialty.length >= 12) {
      return;
    }
  
    // Lấy thêm 4 phần tử tiếp theo từ danh sách đầy đủ
    let newData = fullData.slice(offset, offset + 4);
  
    // Cập nhật state
    this.setState({
      dataSpecialty: [...dataSpecialty, ...newData],
      offset: offset + 4,
    });
  };


  render() {
    let { dataSpecialty } = this.state;
    return (
      <div class="row">
        <div class="col-12">
          <div className="section-share section-specialty">
            <div className="section-container">
              <div className="section-header">
                <span className="title-section">
                  <FormattedMessage id="homepage.specialty-popular" />
                </span>
                <button
                  className="btn-section"
                  onClick={() => this.handleClickSeeMoreSpecialty()}
                >
                  <FormattedMessage id="homepage.more-infor" />
                </button>
              </div>

              <div class="row">
                {
                  dataSpecialty &&
                  dataSpecialty.length > 0 && dataSpecialty.map((item,index)=>{
                    return (
                      <div class="col-lg-3 col-auto my-10">
                          <div class="card-bs-custom pointer" onClick={() => this.handleViewDetailSpecialty(item)}>
                            <figure class="bg-cover bg-center" 
                              style={{
                                      backgroundImage: `url(${item.image})`,
                              }}></figure>
                              <div class="card-body">
                                  <h3 class="mb-5 font-weight-normal pointer specialty-name fs-15" >{item.name}</h3>
                              </div>
                          </div>
                      </div>
                    );
                  })
                }
              </div>
              <div class="d-flex justify-content-center">
                <button type="button" class="btn btn-primary my-15" onClick={() => this.handleLoadMore()}>{this.props.language=="en" ? "Load more" : "Tải thêm"}</button>
              </div>
          
              {/* <div className="section-body">
                <Slider {...this.props.settings}>
                  {dataSpecialty &&
                    dataSpecialty.length > 0 &&
                    dataSpecialty.map((item, index) => {
                      return (
                        <div
                          className="section-customize specialty-child"
                          key={index}
                          onClick={() => this.handleViewDetailSpecialty(item)}
                        >
                          <div
                            className="bg-image section-specialty"
                            style={{
                              backgroundImage: `url(${item.image})`,
                            }}
                          ></div>
                          <div className="specialty-name">{item.name}</div>
                        </div>
                      );
                    })}
                </Slider>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Specialty)
);
