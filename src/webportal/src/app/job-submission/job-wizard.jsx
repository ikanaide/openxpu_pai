// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  getTheme,
  DefaultButton,
  Stack,
  FontSizes,
  FontWeights,
} from 'office-ui-fabric-react';
import { isNil } from 'lodash';

import Card from '../components/card';
import { ReactComponent as IconSingle } from '../../assets/img/job-wizard-single.svg';
import { ReactComponent as IconDistributed } from '../../assets/img/job-wizard-distributed.svg';
import { ReactComponent as IconEdit } from '../../assets/img/job-wizard-edit-config.svg';
import { SpinnerLoading } from '../components/loading';

const WizardButton = ({ children, onClick }) => {
  const { palette, spacing } = getTheme();

  return (
    <DefaultButton
      styles={{
        root: {
          borderRadius: '100%',
          backgroundColor: palette.white,
          boxShadow: `rgba(0, 0, 0, 0.06) 0px 2px 4px, rgba(0, 0, 0, 0.05) 0px 0.5px 1px`,
          width: 215,
          height: 215,
          stroke: palette.black,
        },
        rootHovered: {
          backgroundColor: palette.neutralLight,
        },
        rootPressed: {
          backgroundColor: palette.white,
          borderColor: palette.themePrimary,
          stroke: palette.themePrimary,
        },
      }}
      onClick={onClick}
    >
      <div
        style={{
          padding: spacing.l3,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%' }}>{children}</div>
      </div>
    </DefaultButton>
  );
};

WizardButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};

const JobWizard = ({ setYamlText, history }) => {
  const [loading, setLoading] = useState(true);

  // redirect if job clone or local storage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('op') === 'resubmit') {
      if (params.get('single') === 'true') {
        history.replace('/single');
      } else {
        history.replace('/general');
      }
    } else if (!isNil(window.localStorage.getItem('marketItem'))) {
      if (params.get('single') === 'true') {
        history.replace('/single');
      } else {
        history.replace('/general');
      }
    } else {
      setLoading(false);
    }
  }, []);

  const { spacing, palette } = getTheme();
  if (loading) {
    return <SpinnerLoading />;
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Card style={{ margin: `${spacing.l2}`, width: '100%' }}>
        <Stack horizontalAlign='center' padding={100} gap={100}>
          <div
            style={{
              color: palette.themePrimary,
              fontSize: FontSizes.xxLarge,
              fontWeight: FontWeights.semibold,
              alignItems: 'center',
              position: 'absolute',
            }}
          >
            Select your job type
          </div>
          <Stack
            horizontal
            horizontalAlign='center'
            gap={120}
            style={{ width: '100%', marginTop: 100 }}
          >
            <Stack horizontalAlign='center' gap={50}>
              <WizardButton
                onClick={() => {
                  history.push('/yaml-edit');
                }}
              >
                <IconEdit />
              </WizardButton>
              <div
                style={{
                  fontSize: FontSizes.large,
                  fontWeight: FontWeights.semibold,
                }}
              >
                Config Editor
              </div>
            </Stack>
            <Stack horizontalAlign='center' gap={50}>
              <WizardButton
                onClick={() => {
                  history.push('/single');
                }}
              >
                <IconSingle />
              </WizardButton>
              <div
                style={{
                  fontSize: FontSizes.large,
                  fontWeight: FontWeights.semibold,
                }}
              >
                Single Job
              </div>
            </Stack>
            <Stack horizontalAlign='center' gap={50}>
              <WizardButton
                onClick={() => {
                  history.push('/general');
                }}
              >
                <IconDistributed />
              </WizardButton>
              <div
                style={{
                  fontSize: FontSizes.large,
                  fontWeight: FontWeights.semibold,
                }}
              >
                Distributed Job
              </div>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </div>
  );
};

JobWizard.propTypes = {
  setYamlText: PropTypes.func,
  history: PropTypes.object,
};

export default JobWizard;
