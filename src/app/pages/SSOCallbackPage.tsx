import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function SSOCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // SSO not needed for static site - redirect to home
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}
