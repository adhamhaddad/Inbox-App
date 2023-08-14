// ** Demo Components Imports
import Email from 'src/views/pages/email/Email'

const EmailApp = ({ folder }) => {
  return <Email folder={folder} />
}

export const getStaticPaths = async () => {
  // const res = await axios.get('/apps/email/allEmails')
  // const data = await res.data.emails

  const data = [{ folder: 'inbox' }, { folder: 'sent' }, { folder: 'spam' }, { folder: 'draft' }, { folder: 'trash' }]

  const paths = data.map(mail => ({
    params: { folder: mail.folder }
  }))

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = ({ params }) => {
  return {
    props: {
      folder: params?.folder
    }
  }
}

EmailApp.contentHeightFixed = true

export default EmailApp
