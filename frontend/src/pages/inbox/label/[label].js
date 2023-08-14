// ** Demo Components Imports
import Email from 'src/views/pages/email/Email'

const EmailApp = ({ label }) => {
  return <Email label={label} />
}

export const getStaticPaths = async () => {
  // const res = await axios.get('/apps/email/allEmails')
  // const data = await res.data.emails

  const data = [
    { labels: ['personal', 'private', 'company', 'important'] },
    { labels: ['private', 'personal', 'company', 'important'] },
    { labels: ['company', 'personal', 'private', 'important'] },
    { labels: ['important', 'personal', 'private', 'company'] }
  ]

  const paths = data.map(mail => ({
    params: { label: mail.labels[0].toLowerCase() }
  }))

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = ({ params }) => {
  return {
    props: {
      ...(params && params.label ? { label: params.label } : {})
    }
  }
}

EmailApp.contentHeightFixed = true

export default EmailApp
