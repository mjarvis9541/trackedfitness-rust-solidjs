use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, Message,
    SmtpTransport, Transport,
};
use std::env;

pub fn send_email(name: &str, email: &str, subject: &str, body: &str) {
    let from = "Trackedfitness <noreply@trackedfitness.com>";
    let to = format!("{name} <{email}>");
    let reply_to = String::from("Trackedfitness <noreply@trackedfitness.com>");

    let smtp_user = env::var("SMTP_USER").expect("SMTP_USER env var set");
    let smtp_pass = env::var("SMTP_PASS").expect("SMTP_PASS env var set");
    let smtp_host = env::var("SMTP_HOST").expect("SMTP_HOST env var set");

    let email = Message::builder()
        .from(from.parse().unwrap())
        .reply_to(reply_to.parse().unwrap())
        .to(to.parse().unwrap())
        .subject(subject)
        .header(ContentType::TEXT_PLAIN)
        .body(String::from(body))
        .unwrap();

    let credentials = Credentials::new(smtp_user, smtp_pass);

    let mailer = SmtpTransport::relay(&smtp_host)
        .unwrap()
        .credentials(credentials)
        .build();
    // mailer.send(&email).unwrap();

    match mailer.send(&email) {
        Ok(_) => println!("Email sent successfully!"),
        Err(e) => panic!("Could not send email: {:?}", e),
    }
}
