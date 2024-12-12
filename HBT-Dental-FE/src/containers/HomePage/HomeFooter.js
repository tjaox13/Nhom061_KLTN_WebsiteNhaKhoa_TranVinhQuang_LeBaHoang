import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";

class HomeFooter extends Component {
  render() {
    const footerStyles = {
      backgroundColor: "#49bce2", // Màu nền chủ đạo
      color: "white",
      padding: "40px 0",
      fontFamily: "Arial, sans-serif",
      marginTop: "80px", // Thêm marginTop cho footer
    };

    const containerStyles = {
      display: "flex",
      justifyContent: "space-between",
      padding: "0 60px",
      flexWrap: "wrap", // Để footer tự động xuống dòng trên màn hình nhỏ
    };

    const sectionStyles = {
      flex: 1,
      marginBottom: "20px",
      minWidth: "220px", // Đảm bảo không gian đủ rộng cho mỗi phần
    };

    const sectionHeadingStyles = {
      fontSize: "20px", // Tăng kích thước font của tiêu đề
      fontWeight: "bold",
      marginBottom: "15px",
      textTransform: "uppercase", // Làm cho tiêu đề thêm nổi bật
    };

    const listStyles = {
      listStyleType: "none",
      padding: 0,
    };

    const listItemStyles = {
      margin: "10px 0",
    };

    const listItemLinkStyles = {
      textDecoration: "none",
      color: "white",
      transition: "color 0.3s ease",
      fontSize: "16px",
    };

    const listItemLinkHoverStyles = {
      color: "#ffcc00", // Màu khi hover
    };

    const bottomStyles = {
      backgroundColor: "#3d9bb3", // Màu đậm ở phần dưới
      padding: "10px 0",
      textAlign: "center",
      marginTop: "30px",
    };

    const bottomTextStyles = {
      margin: 0,
      fontSize: "14px",
    };

    return (
      <div style={footerStyles}>
        <div style={containerStyles}>
          {/* Các liên kết */}
          <div style={sectionStyles}>
            <h4 style={sectionHeadingStyles}>
              <FormattedMessage
                id="footer.aboutUs"
                defaultMessage="Về chúng tôi"
              />
            </h4>
            <ul style={listStyles}>
              <li style={listItemStyles}>
                <a
                  href="/lien-he"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  <FormattedMessage
                    id="footer.contactUs"
                    defaultMessage="Liên hệ"
                  />
                </a>
              </li>
              <li style={listItemStyles}>
                <a
                  href="/dich-vu"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  <FormattedMessage
                    id="footer.privacyPolicy"
                    defaultMessage="Dịch vụ"
                  />
                </a>
              </li>
              <li style={listItemStyles}>
                <a
                  href="/gioi-thieu"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  <FormattedMessage
                    id="footer.termsOfService"
                    defaultMessage="Giới thiệu"
                  />
                </a>
              </li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div style={sectionStyles}>
            <h4 style={sectionHeadingStyles}>
              <FormattedMessage id="footer.contact" defaultMessage="Liên hệ" />
            </h4>
            <ul style={listStyles}>
              <li style={listItemStyles}>
                <a
                  href="tel:0906070338"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  <FormattedMessage
                    id="footer.phone"
                    defaultMessage="Phone: 0906070338"
                  />
                </a>
              </li>
              <li style={listItemStyles}>
                <a
                  href="mailto:info@nhakhoahbt.com"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  <FormattedMessage
                    id="footer.email"
                    defaultMessage="Email: phongkhamnhakhoahbt@gmail.com"
                  />
                </a>
              </li>
              <li style={listItemStyles}>
                <a
                  href="#"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  <FormattedMessage
                    id="footer.location"
                    defaultMessage="Địa Chỉ: 877 Đ. Tân Kỳ Tân Quý, Bình Hưng Hoà A, Bình Tân, Hồ Chí Minh"
                  />
                </a>
              </li>
            </ul>
          </div>

          {/* Các liên kết mạng xã hội */}
          <div style={sectionStyles}>
            <h4 style={sectionHeadingStyles}>
              <FormattedMessage
                id="footer.social"
                defaultMessage="Theo dõi chúng tôi"
              />
            </h4>
            <ul style={listStyles}>
              <li style={listItemStyles}>
                <a
                  href="#"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  Facebook
                </a>
              </li>
              <li style={listItemStyles}>
                <a
                  href="#"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  Instagram
                </a>
              </li>
              <li style={listItemStyles}>
                <a
                  href="#"
                  style={listItemLinkStyles}
                  onMouseEnter={(e) => (e.target.style.color = "#ffcc00")}
                  onMouseLeave={(e) => (e.target.style.color = "white")}
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Phần cuối */}
        <div style={bottomStyles}>
          <p style={bottomTextStyles}>
            &copy; 2024 Nha Khoa HBT - All Rights Reserved
          </p>
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

export default connect(mapStateToProps, mapDispatchToProps)(HomeFooter);
